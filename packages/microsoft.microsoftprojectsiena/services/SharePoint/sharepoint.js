//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var Channel = AppMagic.Services.Channel,
        ServicesConstants = AppMagic.Constants.Services,
        SUFFIX_SEPARATOR = "_",
        XML_SCHEMA_NAMESPACE = "http://www.w3.org/2001/XMLSchema",
        XML_SCHEMA_INSTANCE_NAMESPACE = "http://www.w3.org/2001/XMLSchema-instance",
        XML_SOAP_NAMESPACE = "http://schemas.xmlsoap.org/soap/envelope/",
        SHAREPOINT_SOAP_NAMESPACE = "http://schemas.microsoft.com/sharepoint/soap/",
        GET_LIST_COLLECTION_SOAP_ACTION = "http://schemas.microsoft.com/sharepoint/soap/GetListCollection",
        GET_LIST_COLLECTION = "GetListCollection",
        GET_LIST_SOAP_ACTION = "http://schemas.microsoft.com/sharepoint/soap/GetList",
        GET_LIST = "GetList",
        GET_LIST_ITEMS_SOAP_ACTION = "http://schemas.microsoft.com/sharepoint/soap/GetListItems",
        GET_LIST_ITEMS = "GetListItems",
        GET_LIST_ITEMS_ROW_LIMIT_DEFAULT = 1e3,
        UPDATE_LIST_ITEMS_SOAP_ACTION = "http://schemas.microsoft.com/sharepoint/soap/UpdateListItems",
        UPDATE_LIST_ITEMS = "UpdateListItems",
        GETWEBURL_FROM_PAGEURL_SOAP_ACTION = "http://schemas.microsoft.com/sharepoint/soap/WebUrlFromPageUrl",
        GETWEBURL_FROM_PAGEURL = "WebUrlFromPageUrl",
        LIST_ITEM_ROWSET_NAMESPACE = "urn:schemas-microsoft-com:rowset",
        LIST_ITEM_ROW_NAMESPACE = "#RowsetSchema",
        ID_PROPERTY = ServicesConstants.ID_PROPERTY,
        SHAREPOINT_ID_PROPERTY = ServicesConstants.SpIdProperty,
        VERSION_PROPERTY = ServicesConstants.VERSION_PROPERTY,
        UPDATE_CMD_NEW = "New",
        UPDATE_CMD_UPDATE = "Update",
        UPDATE_CMD_DELETE = "Delete";
    function mapSharePointTypeToDType(type) {
        switch (type.toLowerCase()) {
            case"currency":
                return "$";
            case"url":
                return "h";
            case"number":
                return "n";
            case"text":
            default:
                return "s"
        }
        return "s"
    }
    function coerceType(str, type) {
        switch (type) {
            case"$":
            case"n":
                return parseFloat(str);
            case"h":
                var urls = str.split(",");
                return urls.length > 0 ? urls[0].trim() : str;
            case"s":
            default:
                return str
        }
        return str
    }
    function lookupPrefix(nsList, ns) {
        for (var keys = Object.keys(nsList), len = keys.length, i = 0; i < len; i++) {
            var prefix = keys[i];
            if (nsList[prefix] === ns)
                return prefix + ":"
        }
        return ""
    }
    function compareRowAToRowB(rowA, rowB) {
        var rowAKeys = Object.keys(rowA),
            rowBKeys = Object.keys(rowB),
            keysInRowANotInRowB = [],
            changedKeys = rowAKeys.filter(function(rowAKey) {
                var rowBValue = rowB[rowAKey];
                return typeof rowBValue == "undefined" ? (keysInRowANotInRowB.push(rowAKey), !1) : rowA[rowAKey] !== rowBValue
            }),
            keysInRowBNotInRowA = rowBKeys.filter(function(rowBKey) {
                return typeof rowA[rowBKey] == "undefined"
            });
        return {
                keysInRowBNotInRowA: keysInRowBNotInRowA, keysInRowANotInRowB: keysInRowANotInRowB, changedKeys: changedKeys
            }
    }
    function createCleansedMappings(schemaArray, existingSchemaNameToDisplayName) {
        var unusedSchemaNames = {},
            schemaNameToDisplayName = {},
            displayNameToSchemaName = {};
        Object.keys(existingSchemaNameToDisplayName).forEach(function(x) {
            schemaNameToDisplayName[x] = existingSchemaNameToDisplayName[x];
            displayNameToSchemaName[schemaNameToDisplayName[x]] = x;
            unusedSchemaNames[x] = !0
        });
        var displayNameToSchemaItem = {},
            sorted = schemaArray.map(function(x) {
                return displayNameToSchemaItem[x.displayName] = x, x.displayName
            }).sort().map(function(x) {
                return displayNameToSchemaItem[x]
            });
        return sorted.forEach(function(schemaItem) {
                var displayName = schemaItem.displayName,
                    schemaName = displayNameToSchemaName[displayName];
                if (schemaName)
                    delete unusedSchemaNames[schemaName];
                else {
                    var unique = generateValidUniqueSchemaNameFromDisplayName(displayName, schemaNameToDisplayName);
                    schemaNameToDisplayName[unique] = displayName;
                    displayNameToSchemaName[displayName] = unique
                }
            }), Object.keys(unusedSchemaNames).forEach(function(x) {
                var displayName = schemaNameToDisplayName[x];
                delete schemaNameToDisplayName[x];
                delete displayNameToSchemaName[displayName]
            }), {
                    schemaNameToDisplayName: schemaNameToDisplayName, displayNameToSchemaName: displayNameToSchemaName
                }
    }
    function generateSchema(schemaArray) {
        return schemaArray.map(function(schemaItem) {
                return {
                        type: schemaItem.type, name: schemaItem.displayName
                    }
            })
    }
    function generateValidUniqueSchemaNameFromDisplayName(invalid, existingNames) {
        for (var valid = invalid.length === 0 ? "_" : AppMagic.Utility.replaceAllSingleOrDoubleQuotes(invalid, "_"), nameToTry = valid, suffix = 0, forbiddenNames = [ID_PROPERTY, SHAREPOINT_ID_PROPERTY, VERSION_PROPERTY]; typeof existingNames[nameToTry] != "undefined" || forbiddenNames.indexOf(nameToTry) >= 0; )
            suffix++,
            nameToTry = valid + SUFFIX_SEPARATOR + suffix.toString();
        return nameToTry
    }
    function processGetListItemsForQuery(listName, siteUri, result) {
        var rowData = result.items,
            schemaArray = result.schemaArray,
            schemaPointer = generateSchema(schemaArray),
            schema = AppMagic.Schema.createSchemaForArrayFromPointer(schemaPointer);
        return {
                result: rowData, schema: schema, configuration: {
                        siteUri: siteUri, listName: listName
                    }
            }
    }
    function processWebUrl(resp) {
        var result;
        try {
            result = AppMagic.Services.xml2json(resp)
        }
        catch(e) {
            return AppMagic.Services.processError(resp)
        }
        var body = result["soap:Body"];
        if (body === null || typeof body == "undefined")
            throw new Error;
        var resultUrl;
        try {
            if (resultUrl = body.WebUrlFromPageUrlResponse.WebUrlFromPageUrlResult.$text, typeof resultUrl != "string")
                throw new Error;
        }
        catch(e) {
            return AppMagic.Services.processError(resp)
        }
        return resultUrl
    }
    function processLists(resp) {
        var result;
        try {
            result = AppMagic.Services.xml2json(resp)
        }
        catch(e) {
            return AppMagic.Services.processError(resp)
        }
        var body = result["soap:Body"];
        try {
            if (!(body.GetListCollectionResponse.GetListCollectionResult.Lists.List instanceof Array))
                throw new Error;
        }
        catch(e) {
            return AppMagic.Services.processError(resp)
        }
        var lists = body.GetListCollectionResponse.GetListCollectionResult.Lists.List;
        return lists.map(function(x) {
                var attrs = x.$attributes;
                return {
                        id: attrs.ID, count: parseInt(attrs.ItemCount), title: attrs.Title
                    }
            })
    }
    function processListSchema(resp) {
        var result = AppMagic.Services.xml2json(resp);
        var body = result["soap:Body"];
        var fields = body.GetListResponse.GetListResult.List.Fields.Field;
        return fields.filter(function(x) {
                var hidden = x.$attributes.Hidden;
                typeof hidden == "string" && (hidden = hidden.toLowerCase());
                var readonly = x.$attributes.ReadOnly;
                typeof readonly == "string" && (readonly = readonly.toLowerCase());
                var exclude = ["Attachments", "Content Type", ];
                return hidden !== "true" && readonly !== "true" && exclude.indexOf(x.$attributes.DisplayName) === -1
            }).map(function(x) {
                var attrs = x.$attributes;
                return {
                        id: attrs.ID, displayName: attrs.DisplayName, columnName: attrs.StaticName, type: mapSharePointTypeToDType(attrs.Type)
                    }
            })
    }
    function processGetListItemsResponse(schema, resp) {
        var result = AppMagic.Services.xml2json(resp);
        var body = result["soap:Body"];
        var listitems = body.GetListItemsResponse.GetListItemsResult.listitems;
        var rs = lookupPrefix(listitems.$ns, LIST_ITEM_ROWSET_NAMESPACE),
            data = listitems[rs + "data"],
            itemCount = parseInt(data.$attributes.ItemCount, 10);
        if (itemCount > 0) {
            var z = lookupPrefix(listitems.$ns, LIST_ITEM_ROW_NAMESPACE),
                rows = data[z + "row"];
            rows = rows instanceof Array ? rows.map(processListItem.bind(null, schema)) : [processListItem(schema, rows)]
        }
        var displayNameToInternalName = {};
        schema.forEach(function(schemaItem) {
            displayNameToInternalName[schemaItem.displayName] = schemaItem.columnName
        });
        var rowData = rows || [];
        return {
                items: rowData, schemaArray: schema, displayNameToInternalName: displayNameToInternalName
            }
    }
    function processListItem(schema, item) {
        for (var attrs = item.$attributes, row = Object.create(null), i = 0, len = schema.length; i < len; i++) {
            var colSchema = schema[i],
                dispName = colSchema.displayName,
                colName = colSchema.columnName,
                colType = colSchema.type,
                colValue = attrs["ows_" + colName];
            typeof colValue != "undefined" && (row[dispName] = coerceType(colValue, colType))
        }
        var spId = attrs.ows_ID;
        spId = parseInt(spId);
        addEnumerableImmutable(row, SHAREPOINT_ID_PROPERTY, spId);
        var owsHiddenVersion = attrs.ows_owshiddenversion;
        return owsHiddenVersion = parseInt(owsHiddenVersion), row[VERSION_PROPERTY] = owsHiddenVersion, row
    }
    function addEnumerableImmutable(obj, propName, val) {
        Object.defineProperty(obj, propName, {
            configurable: !1, enumerable: !0, value: val, writable: !1
        })
    }
    var SharePoint = WinJS.Class.define(function SharePoint_ctor(){}, {
            _createListChannel: function(siteUri, action, contentLength) {
                return new Channel(siteUri).path("_vti_bin").path("Lists.asmx").header("Content-Type", "text/xml; charset=utf-8").header("Content-Length", contentLength).header("SOAPAction", action)
            }, _createWebChannel: function(siteUri, action, contentLength) {
                    return new Channel(siteUri).path("_vti_bin").path("webs.asmx").header("Content-Type", "text/xml; charset=utf-8").header("Content-Length", contentLength).header("SOAPAction", action)
                }, _createSoapEnvelope: function(fnName, params, queryOptions) {
                    var pkeys,
                        i,
                        len,
                        pname,
                        p,
                        envelope = {
                            $name: "soap:Envelope", $ns: {
                                    xsi: XML_SCHEMA_INSTANCE_NAMESPACE, xsd: XML_SCHEMA_NAMESPACE, soap: XML_SOAP_NAMESPACE
                                }, "soap:Body": {$name: "soap:Body"}
                        },
                        body = envelope["soap:Body"],
                        functionNode = {
                            $name: fnName, $ns: {"": SHAREPOINT_SOAP_NAMESPACE}
                        };
                    if (params !== null)
                        for (pkeys = Object.keys(params), i = 0, len = pkeys.length; i < len; i++)
                            pname = pkeys[i],
                            p = params[pname],
                            functionNode[pname] = {
                                $name: pname, $text: p.toString()
                            };
                    return queryOptions !== null && (functionNode.QueryOptions = queryOptions), body[fnName] = functionNode, AppMagic.Services.json2xml(envelope)
                }, configure: function(config) {
                    return !0
                }, getLists: function(siteUri) {
                    var envelope = this._createSoapEnvelope(GET_LIST_COLLECTION, null, null),
                        clen = envelope.length;
                    return this._createListChannel(siteUri, GET_LIST_COLLECTION_SOAP_ACTION, clen).post(envelope).then(processLists, AppMagic.Services.processError)
                }, getHost: function(siteUri) {
                    var hostNameBeginIndicator = "://",
                        hostNameBeginIndicatorIndex = siteUri.indexOf(hostNameBeginIndicator);
                    if (hostNameBeginIndicatorIndex === -1 || siteUri.length <= hostNameBeginIndicatorIndex + hostNameBeginIndicator.length)
                        throw new Error;
                    var hostNameEndIndex = siteUri.indexOf("/", hostNameBeginIndicatorIndex + hostNameBeginIndicator.length);
                    if (hostNameEndIndex === -1)
                        throw new Error;
                    return siteUri.substr(0, hostNameEndIndex)
                }, getEncodedUri: function(siteUri) {
                    var queryStringIndex = siteUri.indexOf("?");
                    if (queryStringIndex === -1)
                        return siteUri;
                    var queryString = siteUri.substr(queryStringIndex + 1),
                        decodedUri = decodeURIComponent(queryString);
                    return siteUri.substr(0, queryStringIndex) + "?" + encodeURIComponent(decodedUri)
                }, getWebUrlFromPageUrl: function(siteUri) {
                    return WinJS.Promise.wrap().then(function() {
                            var params = {pageUrl: this.getEncodedUri(siteUri)},
                                envelope = this._createSoapEnvelope(GETWEBURL_FROM_PAGEURL, params, null),
                                clen = envelope.length,
                                hostName = this.getHost(siteUri);
                            return this._createWebChannel(hostName, GETWEBURL_FROM_PAGEURL_SOAP_ACTION, clen).post(envelope).then(processWebUrl.bind(null))
                        }.bind(this)).then(null, AppMagic.Services.processError)
                }, getListSchema: function(siteUri, listName) {
                    var params = {listName: listName},
                        envelope = this._createSoapEnvelope(GET_LIST, params, null),
                        clen = envelope.length;
                    return this._createListChannel(siteUri, GET_LIST_SOAP_ACTION, clen).post(envelope).then(processListSchema, AppMagic.Services.processError)
                }, queryListDataSource: function(dsState) {
                    var siteUri = dsState.siteUri,
                        listName = dsState.listName,
                        options = dsState.options;
                    var SharePointSyncWorker = AppMagic.Services.SharePointSyncWorker;
                    return SharePointSyncWorker.getList(siteUri, listName).then(function(getListResponse) {
                            if (!getListResponse.success)
                                return AppMagic.Services.Results.createError(getListResponse.message);
                            var processListSchemaResult = SharePointSyncWorker.getFieldsFromListSchema(getListResponse.result);
                            if (!processListSchemaResult.success)
                                return AppMagic.Services.Results.createError(processListSchemaResult.message);
                            var listSchema = processListSchemaResult.result;
                            return SharePointSyncWorker.getListItems(siteUri, listName).then(function(getListItemsResponse) {
                                    if (!getListItemsResponse.success)
                                        return AppMagic.Services.Results.createError(getListItemsResponse.message);
                                    var processedlistItemsResponse = SharePointSyncWorker.processGetListItemsResponse(listSchema, getListItemsResponse.result);
                                    if (!processedlistItemsResponse.success)
                                        return AppMagic.Services.Results.createError(processedlistItemsResponse.message);
                                    var schemaPointer = listSchema.map(function(schemaItem) {
                                            return {
                                                    name: schemaItem.displayName, type: schemaItem.dtype
                                                }
                                        }),
                                        schema = AppMagic.Schema.createSchemaForArrayFromPointer(schemaPointer);
                                    return {
                                            result: processedlistItemsResponse.result, schema: schema, configuration: {
                                                    siteUri: siteUri, listName: listName
                                                }
                                        }
                                })
                        })
                }, _getListItems: function(siteUri, listName, options) {
                    var opts = options || {},
                        count = (opts.count || GET_LIST_ITEMS_ROW_LIMIT_DEFAULT).toString(),
                        index = (opts.index || 0).toString(),
                        that = this;
                    return this.getListSchema(siteUri, listName).then(function(schema) {
                            var params = {
                                    listName: listName, rowLimit: count
                                },
                                queryOptions = {
                                    $name: "QueryOptions", Paging: {
                                            $name: "Paging", $attributes: {ListItemCollectionPositionNext: index}
                                        }, DateInUtc: {
                                            $name: "DateInUtc", $text: "TRUE"
                                        }
                                },
                                envelope = that._createSoapEnvelope(GET_LIST_ITEMS, params, queryOptions),
                                clen = envelope.length;
                            return that._createListChannel(siteUri, GET_LIST_ITEMS_SOAP_ACTION, clen).post(envelope).then(processGetListItemsResponse.bind(null, schema))
                        })
                }, _computeSyncInformation: function(localData, localSchemaNames, localSchemaNameToDisplayName, serverData, serverDisplayNameToSchemaName, serverSchemaArray, workspaceData) {
                    var i,
                        len,
                        deleteLocalRows = {},
                        spIdToLocalRow = {},
                        spIdToWorkspaceRow = {};
                    workspaceData.forEach(function(x) {
                        spIdToWorkspaceRow[x[SHAREPOINT_ID_PROPERTY]] = x
                    });
                    var newLocalData = localData.filter(function(x) {
                            var spId = x[SHAREPOINT_ID_PROPERTY];
                            return typeof spId != "undefined" ? (deleteLocalRows[spId] = x, spIdToLocalRow[spId] = x, !1) : !0
                        }),
                        conflictsExist = !1,
                        conflictServerRows = {},
                        spIdsOfRowsLocallyEditedToDiffs = {},
                        editLocallyServerRows = {},
                        getServerRows = {},
                        deleteServerRows = {},
                        rowIdToNewVersion = {};
                    for (i = 0, len = serverData.length; i < len; i++) {
                        var serverRow = serverData[i],
                            serverSpId = serverRow[SHAREPOINT_ID_PROPERTY],
                            localRow = spIdToLocalRow[serverSpId],
                            workspaceRow = spIdToWorkspaceRow[serverSpId];
                        if (localRow) {
                            var serverRowVersion = serverRow[VERSION_PROPERTY];
                            var localRowUsingDisplayNameKeys = {};
                            localSchemaNames.forEach(function(schemaNameKey) {
                                var localValue = localRow[schemaNameKey];
                                typeof localValue != "undefined" && (localRowUsingDisplayNameKeys[localSchemaNameToDisplayName[schemaNameKey]] = localValue)
                            });
                            var serverRowWithoutMetadata = {};
                            serverSchemaArray.forEach(function(schemaItem) {
                                typeof serverRow[schemaItem.displayName] != "undefined" && (serverRowWithoutMetadata[schemaItem.displayName] = serverRow[schemaItem.displayName])
                            });
                            var localDiffServer = compareRowAToRowB(localRowUsingDisplayNameKeys, serverRowWithoutMetadata);
                            if (localDiffServer.changedKeys.length > 0) {
                                var workspaceRowVersion = workspaceRow[VERSION_PROPERTY];
                                if (workspaceRowVersion === serverRowVersion)
                                    spIdsOfRowsLocallyEditedToDiffs[serverSpId] = localDiffServer;
                                else {
                                    var localDiffWorkspace = compareRowAToRowB(localRow, workspaceRow);
                                    if (localDiffWorkspace.changedKeys.length > 0) {
                                        var copyOfConflictServerRow = {};
                                        Object.keys(serverRow).forEach(function(x) {
                                            var conflictSchemaName = serverDisplayNameToSchemaName[x];
                                            conflictSchemaName ? copyOfConflictServerRow[conflictSchemaName] = serverRow[x] : copyOfConflictServerRow[x] = serverRow[x]
                                        });
                                        var copyOfChangedKeys = localDiffServer.changedKeys.map(function(x) {
                                                return serverDisplayNameToSchemaName[x] || x
                                            });
                                        conflictServerRows[localRow[ID_PROPERTY]] = {
                                            serverRow: copyOfConflictServerRow, changedKeys: copyOfChangedKeys
                                        };
                                        conflictsExist = !0
                                    }
                                    else
                                        editLocallyServerRows[localRow[ID_PROPERTY]] = serverRow
                                }
                            }
                            else
                                localDiffServer.keysInRowBNotInRowA.length > 0 ? editLocallyServerRows[localRow[ID_PROPERTY]] = serverRow : localDiffServer.keysInRowANotInRowB.length > 0 ? editLocallyServerRows[localRow[ID_PROPERTY]] = serverRow : localRow[VERSION_PROPERTY] !== serverRowVersion && (rowIdToNewVersion[localRow[ID_PROPERTY]] = serverRowVersion);
                            delete deleteLocalRows[serverSpId]
                        }
                        else
                            workspaceRow ? deleteServerRows[serverSpId] = serverRow : getServerRows[serverSpId] = serverRow
                    }
                    return {
                            conflictsExist: conflictsExist, conflictServerRows: conflictServerRows, newLocalData: newLocalData, deleteLocalRows: deleteLocalRows, spIdsOfRowsLocallyEditedToDiffs: spIdsOfRowsLocallyEditedToDiffs, editLocallyServerRows: editLocallyServerRows, getServerRows: getServerRows, deleteServerRows: deleteServerRows, rowIdToNewVersion: rowIdToNewVersion, spIdToLocalRow: spIdToLocalRow
                        }
                }, synchronizeListDataSource: function(dsState, localData, workspaceData) {
                    var siteUri = dsState.siteUri,
                        listName = dsState.listName,
                        localSchemaNameToDisplayName = dsState.schemaNameToDisplayName;
                    return this._getListItems(siteUri, listName, {}).then(function(result) {
                            var serverData = result.items,
                                serverSchemaArray = result.schemaArray,
                                serverDisplayNameToInternalName = result.displayNameToInternalName,
                                localSchemaNames = Object.keys(localSchemaNameToDisplayName),
                                serverMappings = createCleansedMappings(serverSchemaArray, localSchemaNameToDisplayName),
                                serverDisplayNameToSchemaName = serverMappings.displayNameToSchemaName,
                                serverSchema = generateSchema(serverSchemaArray),
                                syncInfo = this._computeSyncInformation(localData, localSchemaNames, localSchemaNameToDisplayName, serverData, serverDisplayNameToSchemaName, serverSchemaArray, workspaceData),
                                conflictsExist = syncInfo.conflictsExist,
                                conflictServerRows = syncInfo.conflictServerRows,
                                newLocalData = syncInfo.newLocalData,
                                deleteLocalRows = syncInfo.deleteLocalRows,
                                spIdsOfRowsLocallyEditedToDiffs = syncInfo.spIdsOfRowsLocallyEditedToDiffs,
                                editLocallyServerRows = syncInfo.editLocallyServerRows,
                                getServerRows = syncInfo.getServerRows,
                                deleteServerRows = syncInfo.deleteServerRows,
                                rowIdToNewVersion = syncInfo.rowIdToNewVersion,
                                spIdToLocalRow = syncInfo.spIdToLocalRow;
                            if (conflictsExist)
                                return {
                                        success: !1, conflicts: conflictServerRows, dataChangesIfResolved: {
                                                schema: serverSchema, configuration: {
                                                        listName: listName, siteUri: siteUri, schemaNameToDisplayName: serverMappings.schemaNameToDisplayName
                                                    }
                                            }
                                    };
                            else {
                                var dataMsg = {},
                                    methodCount = 0,
                                    key,
                                    updateIdToRowId = {},
                                    localDisplayNameToSchemaName = {};
                                localSchemaNames.forEach(function(x) {
                                    localDisplayNameToSchemaName[localSchemaNameToDisplayName[x]] = x
                                });
                                for (var spIdsOfRowsLocallyEdited = Object.keys(spIdsOfRowsLocallyEditedToDiffs), i = 0, len = spIdsOfRowsLocallyEdited.length; i < len; i++) {
                                    var spIdOfRowToBeEdited = spIdsOfRowsLocallyEdited[i],
                                        keyDifferences = spIdsOfRowsLocallyEditedToDiffs[spIdOfRowToBeEdited];
                                    var updatedFields = {
                                            ID: spIdOfRowToBeEdited, owshiddenversion: spIdToLocalRow[spIdOfRowToBeEdited][VERSION_PROPERTY]
                                        };
                                    keyDifferences.changedKeys.forEach(function(displayName) {
                                        var internalName = serverDisplayNameToInternalName[displayName];
                                        var schemaName = localDisplayNameToSchemaName[displayName];
                                        updatedFields[internalName] = spIdToLocalRow[spIdOfRowToBeEdited][schemaName]
                                    });
                                    dataMsg["methodID" + methodCount.toString()] = this._buildMethodMsg(methodCount, UPDATE_CMD_UPDATE, updatedFields);
                                    updateIdToRowId[methodCount] = spIdToLocalRow[spIdOfRowToBeEdited][ID_PROPERTY];
                                    methodCount++
                                }
                                for (key in deleteServerRows) {
                                    var deleteServerRow = deleteServerRows[key];
                                    dataMsg["methodID" + methodCount.toString()] = this._buildMethodMsg(methodCount, UPDATE_CMD_DELETE, {
                                        ID: deleteServerRow[SHAREPOINT_ID_PROPERTY], owshiddenversion: deleteServerRow[VERSION_PROPERTY]
                                    });
                                    methodCount++
                                }
                                var methodIdToNewLocalRowCopy = {};
                                for (i = 0, len = newLocalData.length; i < len; i++) {
                                    var newLocalRow = newLocalData[i],
                                        fields = {},
                                        newLocalRowCopy = {};
                                    Object.keys(newLocalRow).forEach(function(x) {
                                        if (x !== ID_PROPERTY) {
                                            var displayName = localSchemaNameToDisplayName[x];
                                            var internalName = serverDisplayNameToInternalName[displayName];
                                            internalName && (fields[internalName] = newLocalRow[x])
                                        }
                                        newLocalRowCopy[x] = newLocalRow[x]
                                    });
                                    dataMsg["methodID" + methodCount.toString()] = this._buildMethodMsg(methodCount, UPDATE_CMD_NEW, fields);
                                    methodIdToNewLocalRowCopy[methodCount] = newLocalRowCopy;
                                    methodCount++
                                }
                                var workspaceUpdateInfo = {
                                        deleteLocalRows: deleteLocalRows, editLocallyServerRows: editLocallyServerRows, getServerRows: getServerRows, rowIdToNewVersion: rowIdToNewVersion, methodIdToNewLocalRowCopy: methodIdToNewLocalRowCopy, spIdOfUpdatedRowToNewVersion: {}, serverDisplayNameToSchemaName: serverDisplayNameToSchemaName, serverSchema: serverSchema, serverMappings: serverMappings, success: !0, reattempt: !0, dsState: dsState
                                    };
                                if (methodCount > 0) {
                                    dataMsg.$name = "Batch";
                                    dataMsg.$attributes = {OnError: "Return"};
                                    var payload = AppMagic.Services.json2xml(dataMsg, !0),
                                        envelope = this._createSoapEnvelope(UPDATE_LIST_ITEMS, {
                                            listName: listName, updates: payload
                                        }, null),
                                        clen = envelope.length;
                                    return this._createListChannel(siteUri, UPDATE_LIST_ITEMS_SOAP_ACTION, clen).post(envelope).then(this._processListUpdate.bind(this, localData, workspaceUpdateInfo, updateIdToRowId), AppMagic.Services.processError)
                                }
                                else
                                    return this._updateWorkspace(workspaceUpdateInfo, localData)
                            }
                        }.bind(this))
                }, _processListUpdate: function(data, workspaceUpdateInfo, updateIdToRowId, resp) {
                    var response;
                    try {
                        response = AppMagic.Services.xml2json(resp)
                    }
                    catch(e) {
                        return AppMagic.Services.Results.createError(AppMagic.Strings.UnRecognizedResponseFormat)
                    }
                    var results;
                    if (!response || !response["soap:Body"] || !response["soap:Body"].UpdateListItemsResponse || !response["soap:Body"].UpdateListItemsResponse.UpdateListItemsResult || !(results = response["soap:Body"].UpdateListItemsResponse.UpdateListItemsResult.Results))
                        return AppMagic.Services.Results.createError(AppMagic.Strings.UnRecognizedResponseFormat);
                    var getMethodId = function(resultString) {
                            var matches = /^\d+/.exec(resultString);
                            return matches[0]
                        },
                        CONFLICT_ERROR = "0x81020015",
                        FORCED_RETURN_ERROR = "0x800704c7",
                        anyNonConflictTypeErrors = !1,
                        success = !0,
                        resultArray = results.Result;
                    resultArray instanceof Array || (resultArray = [resultArray]);
                    for (var rowIdToNewVersion = workspaceUpdateInfo.rowIdToNewVersion, j, jlen, i = 0, len = resultArray.length; i < len; i++) {
                        var result = resultArray[i];
                        var successfulMethod = result.ErrorCode.$text === "0x00000000";
                        if (success = success && successfulMethod, successfulMethod || result.ErrorCode.$text === CONFLICT_ERROR || result.ErrorCode.$text.toLowerCase() === FORCED_RETURN_ERROR || (anyNonConflictTypeErrors = !0), result.$attributes.ID.match(UPDATE_CMD_NEW)) {
                            if (successfulMethod) {
                                var localRow = workspaceUpdateInfo.methodIdToNewLocalRowCopy[getMethodId(result.$attributes.ID)];
                                var spId = parseInt(result["z:row"].$attributes.ows_ID),
                                    version = parseInt(result["z:row"].$attributes.ows_owshiddenversion);
                                localRow[SHAREPOINT_ID_PROPERTY] = spId;
                                localRow[VERSION_PROPERTY] = version
                            }
                        }
                        else if (result.$attributes.ID.match(UPDATE_CMD_UPDATE) && successfulMethod) {
                            var rowIdOfUpdatedRow = updateIdToRowId[getMethodId(result.$attributes.ID)];
                            var newVersion = parseInt(result["z:row"].$attributes.ows_owshiddenversion);
                            rowIdToNewVersion[rowIdOfUpdatedRow] = newVersion
                        }
                    }
                    return workspaceUpdateInfo.success = success, workspaceUpdateInfo.reattempt = !anyNonConflictTypeErrors, this._updateWorkspace(workspaceUpdateInfo, data)
                }, _updateWorkspace: function(workspaceUpdateInfo, localData) {
                    var deleteLocalRows = workspaceUpdateInfo.deleteLocalRows,
                        editLocallyServerRows = workspaceUpdateInfo.editLocallyServerRows,
                        rowIdToNewVersion = workspaceUpdateInfo.rowIdToNewVersion,
                        serverDisplayNameToSchemaName = workspaceUpdateInfo.serverDisplayNameToSchemaName,
                        serverSchema = workspaceUpdateInfo.serverSchema,
                        serverMappings = workspaceUpdateInfo.serverMappings,
                        dsState = workspaceUpdateInfo.dsState;
                    var deleteData = {},
                        editData = {},
                        addData = [],
                        versionUpdateData = {},
                        getServerRows = workspaceUpdateInfo.getServerRows;
                    Object.keys(getServerRows).forEach(function copyNewRowToWorkspace(x) {
                        var srcRow = getServerRows[x],
                            copy = {};
                        for (var key in srcRow)
                            copy[key] = srcRow[key];
                        addData.push(copy)
                    });
                    Object.keys(deleteLocalRows).forEach(function(x) {
                        var rowIdToDelete = deleteLocalRows[x][ID_PROPERTY];
                        deleteData[rowIdToDelete] = !0
                    });
                    var displayNames = Object.keys(serverDisplayNameToSchemaName);
                    Object.keys(editLocallyServerRows).forEach(function(x) {
                        var serverRow = editLocallyServerRows[x],
                            serverRowCopy = {};
                        displayNames.forEach(function(displayName) {
                            var value = serverRow[displayName];
                            if (typeof value != "undefined") {
                                var schemaName = serverDisplayNameToSchemaName[displayName];
                                serverRowCopy[schemaName] = value
                            }
                        });
                        serverRowCopy[SHAREPOINT_ID_PROPERTY] = serverRow[SHAREPOINT_ID_PROPERTY];
                        serverRowCopy[VERSION_PROPERTY] = serverRow[VERSION_PROPERTY];
                        editData[x] = serverRowCopy
                    });
                    var methodIdToNewLocalRowCopy = workspaceUpdateInfo.methodIdToNewLocalRowCopy;
                    return Object.keys(methodIdToNewLocalRowCopy).forEach(function(methodId) {
                            var newLocalRowCopy = methodIdToNewLocalRowCopy[methodId];
                            editData[newLocalRowCopy[ID_PROPERTY]] = newLocalRowCopy
                        }), Object.keys(rowIdToNewVersion).forEach(function(x) {
                            versionUpdateData[x] = rowIdToNewVersion[x]
                        }), WinJS.Promise.wrap({
                                success: workspaceUpdateInfo.success, reattempt: workspaceUpdateInfo.reattempt, dataChanges: {
                                        addData: addData, editData: editData, deleteData: deleteData, versionUpdateData: versionUpdateData, schema: serverSchema
                                    }, configuration: {
                                        listName: dsState.listName, siteUri: dsState.siteUri, schemaNameToDisplayName: serverMappings.schemaNameToDisplayName
                                    }
                            })
                }, _buildMethodMsg: function(id, type, fields) {
                    for (var methodMsg = {
                            $name: "Method", $attributes: {
                                    ID: id, Cmd: type
                                }
                        }, keys = Object.keys(fields), i = 0, len = keys.length; i < len; i++)
                        methodMsg["Field" + i] = {
                            $name: "Field", $attributes: {Name: keys[i]}, $text: fields[keys[i]].toString()
                        };
                    return methodMsg
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Services", {SharePoint: SharePoint})
})();