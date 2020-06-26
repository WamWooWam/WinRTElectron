//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var StringConsts = {
            tagApplicationData: "ApplicationData", tagData: "Data", tagTable: "Table", tagRow: "Row", tagCell: "Cell", tagRecord: "Record", attrName: "ss:Name", attrType: "ss:Type", msImpexAppdataScheme: "ms-appdata:///temp/{0}/Assets/", xmlFileName: "data.xml", schemaFileName: "schema.json", locMapFileName: "locMap.json", invariantNameKey: "invariantName"
        },
        ImportExportErrors = AppMagic.Constants.ImportExportErrors,
        runtimeConstants = AppMagic.Constants.Runtime;
    function createZip(root) {
        var result;
        try {
            result = json2xml(root.data, root.schema, root.blobs)
        }
        catch(err) {
            return typeof err != "string" && (err = ImportExportErrors.ExportUnknownError), WinJS.Promise.as({error: err})
        }
        var xmlText = result.text,
            assets = result.assets,
            promises = [],
            zip = new JSZip;
        zip.file(StringConsts.xmlFileName, xmlText);
        zip.file(StringConsts.schemaFileName, JSON.stringify(result.typeInfo));
        for (var blobs = Object.keys(assets.blobs), i = 0; i < blobs.length; i++) {
            var blobUrl = blobs[i],
                blobPath = assets.blobs[blobUrl],
                blobData = root.blobs[blobUrl];
            blobData && zip.file(blobPath, blobData.base64String, {base64: !0})
        }
        var resources = Object.keys(assets.resources);
        for (i = 0; i < resources.length; i++) {
            var resourcePath = resources[i];
            promises.push(_getFileData(resourcePath).then(function(path, string64) {
                zip.file(path, string64, {base64: !0})
            }.bind(null, assets.resources[resourcePath])))
        }
        return WinJS.Promise.join(promises).then(function() {
                var zipFile = zip.generate();
                return {base64String: zipFile}
            }, function() {
                return {error: ImportExportErrors.ExportUnknownError}
            })
    }
    function loadZip(args) {
        try {
            var zip = new JSZip(args.base64String, {base64: !0})
        }
        catch(ex) {
            return WinJS.Promise.as({error: ImportExportErrors.ImportCorruptedZipError})
        }
        var xmlFile = zip.files[StringConsts.xmlFileName];
        if (typeof xmlFile == "undefined")
            return WinJS.Promise.as({error: ImportExportErrors.ImportXMLNotFoundError});
        var schemaFile = zip.files[StringConsts.schemaFileName],
            schema;
        if (typeof schemaFile != "undefined")
            try {
                schema = JSON.parse(schemaFile.asText())
            }
            catch(ex) {
                return WinJS.Promise.as({error: ImportExportErrors.ImportInvalidJSONError})
            }
        var dataWithLocMapJson = zip.files[StringConsts.locMapFileName],
            dataWithLocMap;
        if (typeof dataWithLocMapJson != "undefined")
            try {
                dataWithLocMap = JSON.parse(dataWithLocMapJson.asText())
            }
            catch(ex) {
                dataWithLocMap = null
            }
        var xmlText = xmlFile.asText(),
            promises = [];
        for (var fileName in zip.files) {
            var file = zip.files[fileName];
            if (typeof file.options == "undefined" || typeof file.name == "undefined")
                return WinJS.Promise.as({error: ImportExportErrors.ImportUnkownError});
            if (!file.options.dir && file.name !== StringConsts.xmlFileName && file.name !== StringConsts.schemaFileName) {
                if (typeof file.asUint8Array != "function")
                    return WinJS.Promise.as({error: ImportExportErrors.ImportUnkownError});
                var data = file.asUint8Array(),
                    url = file.name;
                promises.push(_createResourceFile(data, args.impexID + "/" + url))
            }
        }
        return WinJS.Promise.join(promises).then(function() {
                try {
                    var tableData = xml2json(xmlText, args.impexID, schema);
                    return dataWithLocMap && (_applyLocMapToTableData(tableData.data, dataWithLocMap), _importDataAcrossLocale(tableData.data, tableData.data), tableData.locMap = dataWithLocMapJson.asText()), tableData
                }
                catch(error) {
                    return {error: ImportExportErrors.ImportInvalidXMLError}
                }
            }, function() {
                return {error: ImportExportErrors.ImportUnkownError}
            })
    }
    function _applyLocMapToTableData(tableData, dataWithLocMap) {
        Contracts.checkArray(tableData);
        Contracts.checkArray(dataWithLocMap);
        Contracts.check(tableData.length === dataWithLocMap.length);
        var processRecord = function(recordData, recLocMap) {
                Contracts.checkPureObject(recordData);
                Contracts.checkObject(recLocMap);
                for (var keys = Object.keys(recordData), j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    recordData[key] instanceof Array ? processTable(recordData[key], recLocMap[key]) : recordData[key] !== null && typeof recordData[key] == "object" && (Contracts.checkObject(recLocMap[key]), processRecord(recordData[key], recLocMap[key]))
                }
                recLocMap[runtimeConstants.controlLocMapProperty] && (recordData[runtimeConstants.controlLocMapProperty] = recLocMap[runtimeConstants.controlLocMapProperty])
            },
            processTable = function(data, tableLocMap) {
                for (var i = 0; i < data.length; i++)
                    data[i] && tableLocMap[i] && processRecord(data[i], tableLocMap[i])
            };
        processTable(tableData, dataWithLocMap)
    }
    function _importDataAcrossLocale(data, dataWithLocMap) {
        Contracts.checkArray(data);
        Contracts.checkArray(dataWithLocMap);
        Contracts.check(data.length === dataWithLocMap.length);
        var processRecord = function(recordData, recLocMap) {
                Contracts.checkPureObject(recordData);
                Contracts.checkObject(recLocMap);
                for (var invariantName, keys = Object.keys(recLocMap), j = 0; j < keys.length; j++) {
                    var key = keys[j];
                    recordData[key] instanceof Array ? (processTable(recordData[key], recordData[key]), invariantName = recLocMap[key][StringConsts.invariantNameKey], swapData(recordData, key, invariantName)) : recordData[key] !== null && typeof recordData[key] == "object" ? (Contracts.checkObject(recLocMap[key]), processRecord(recordData[key], recLocMap[key]), invariantName = recLocMap[key][StringConsts.invariantNameKey], swapData(recordData, key, invariantName)) : typeof recLocMap[key] == "string" ? (invariantName = recLocMap[key], swapData(recordData, key, invariantName)) : (invariantName = recLocMap[key][StringConsts.invariantNameKey], swapData(recordData, key, invariantName))
                }
            },
            swapData = function(dataObj, sourceKey, targetKey) {
                (Contracts.checkPureObject(dataObj), Contracts.checkNonEmpty(sourceKey), Contracts.checkStringOrUndefined(targetKey), typeof targetKey != "undefined" && sourceKey !== targetKey && typeof dataObj[sourceKey] != "undefined") && (dataObj[targetKey] = dataObj[sourceKey], delete dataObj[sourceKey])
            },
            processTable = function(tableData, tableLocMap) {
                for (var i = 0; i < tableData.length; i++) {
                    var locMap = tableLocMap[i][runtimeConstants.controlLocMapProperty] || {};
                    tableData[i] && processRecord(tableData[i], locMap)
                }
            };
        processTable(data, dataWithLocMap)
    }
    function _createResourceFile(data, url) {
        var path = url.replace(/\//g, "\\");
        return Platform.Storage.ApplicationData.current.temporaryFolder.createFileAsync(path, Platform.Storage.CreationCollisionOption.openIfExists).then(function(file) {
                return Platform.Storage.FileIO.writeBytesAsync(file, data).then(function() {
                        return !0
                    }, function(error) {
                        return !1
                    })
            }, function() {
                return WinJS.Promise.as(!1)
            })
    }
    function _getFileData(url) {
        try {
            var uri = new Platform.Foundation.Uri(url)
        }
        catch(ex) {
            return WinJS.Promise.wrapError(ex)
        }
        return Platform.Storage.StorageFile.getFileFromApplicationUriAsync(uri).then(function(file) {
                return Platform.Storage.FileIO.readBufferAsync(file).then(function(buffer) {
                        return Platform.Security.Cryptography.CryptographicBuffer.encodeToBase64String(buffer)
                    })
            })
    }
    function json2xml(root, schema, blobs) {
        var assets = {
                blobs: {}, resources: {}
            },
            typeInfo = {tableSchema: schema},
            typeIndex = 0,
            processNode = function(nodeName, node) {
                if (node === null)
                    return typeInfo[typeIndex++] = {
                            tag: nodeName, type: typeof node
                        }, "<" + nodeName + " />";
                switch (typeof node) {
                    case"number":
                    case"boolean":
                        return typeInfo[typeIndex++] = {
                                tag: nodeName, type: typeof node
                            }, "<" + nodeName + ">" + node.toString() + "<\/" + nodeName + ">";
                    case"string":
                        return typeInfo[typeIndex++] = {
                                tag: nodeName, type: typeof node
                            }, processStringNode(nodeName, node);
                    case"object":
                        return node instanceof Array ? processTable(nodeName, node) : processRecord(nodeName, node, !1, Object.create(null));
                    default:
                        break
                }
                return "<" + StringConsts.tagData + " />"
            },
            processStringNode = function(nodeName, node) {
                var stringNode = node.toString();
                if (stringNode.length === 0)
                    return "<" + nodeName + "/>";
                var xmlEntry = stringNode;
                if (/^blob:/g.test(stringNode)) {
                    var blobType = blobs[stringNode].contentType,
                        fileName = stringNode.replace(":", "-"),
                        extension;
                    switch (blobType) {
                        case"image/jpeg":
                        case"image/pjpeg":
                            extension = ".jpeg";
                            break;
                        case"image/png":
                            extension = ".png";
                            break;
                        case"image/gif":
                            extension = ".gif";
                            break;
                        case"image/svg+xml":
                            extension = ".svg";
                            break;
                        case"audio/mp3":
                        case"audio/mpeg":
                            extension = ".mp3";
                            break;
                        case"audio/ogg":
                            extension = ".ogg";
                            break;
                        case"audio/mp4":
                            extension = ".mp4";
                            break;
                        case"audio/vnd.wave":
                        case"audio/x-wav":
                            extension = ".wav";
                            break;
                        default:
                            extension = "";
                            break
                    }
                    fileName += extension;
                    xmlEntry = StringConsts.msImpexAppdataScheme + fileName;
                    assets.blobs[stringNode] = "Assets/" + fileName
                }
                else
                    /^ms-appdata:/g.test(stringNode) ? (fileName = getFileNameWithExtension(stringNode), xmlEntry = StringConsts.msImpexAppdataScheme + fileName, assets.resources[stringNode] = "Assets/" + fileName) : /^ms-appx:/g.test(stringNode) ? (fileName = getFileNameWithExtension(stringNode), xmlEntry = StringConsts.msImpexAppdataScheme + fileName, assets.resources[stringNode] = "Assets/" + fileName) : xmlEntry = escape(stringNode);
                return "<" + nodeName + ">" + xmlEntry + "<\/" + nodeName + ">"
            },
            getFileNameWithExtension = function(path) {
                var index = path.lastIndexOf("/");
                return path.substring(index + 1)
            },
            getUniqueExcelColumnName = function(nameId) {
                var seed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
                    seedLen = seed.length;
                if (nameId < seedLen)
                    return seed.charAt(nameId);
                var id1 = Math.floor(nameId / seedLen) - 1,
                    id2 = Math.floor(nameId % seedLen);
                return id1 < seedLen ? seed.charAt(id1) + seed.charAt(id2) : seed.substr(id2, 1) + Math.floor(Math.random() * 1e4).toString()
            },
            processColumnMap = function(columnMap) {
                typeInfo[typeIndex++] = {
                    tag: StringConsts.tagRow, type: "object", kind: "header"
                };
                for (var xml = "<" + StringConsts.tagRow + ">", columns = Object.keys(columnMap), i = 0, colLen = columns.length; i < colLen; i++) {
                    var ourName = columns[i],
                        excelName = columnMap[columns[i]];
                    xml += "\r\n<" + excelName + ">" + ourName + "<\/" + excelName + ">";
                    typeInfo[typeIndex++] = {
                        tag: excelName, type: "string"
                    }
                }
                return xml + "\r\n<\/" + StringConsts.tagRow + ">"
            },
            reverseMap = function(columnMap) {
                for (var revMap = {}, keys = Object.keys(columnMap), keysLen = keys.length, i = 0; i < keysLen; i++)
                    revMap[columnMap[keys[i]]] = keys[i];
                return revMap
            },
            processTable = function(xmlNodeName, node) {
                for (var xml = "\r\n<" + xmlNodeName, len = node.length, nameId = 0, columnMap = Object.create(null), i = 0; i < len; i++) {
                    var row = node[i];
                    if (row !== null && typeof row == "object")
                        for (var keys = Object.keys(row), j = 0, keysLen = keys.length; j < keysLen; j++) {
                            var fieldName = keys[j];
                            isPrivateProperty(fieldName) || columnMap[fieldName] || (columnMap[fieldName] = getUniqueExcelColumnName(nameId++))
                        }
                }
                if (typeInfo[typeIndex++] = {
                    tag: xmlNodeName, type: "array", columnMap: reverseMap(columnMap)
                }, len === 0)
                    return xml + " />";
                for (xml += ">", xml += "\r\n" + processColumnMap(columnMap), i = 0; i < len; i++)
                    xml += "\r\n" + processRecord(StringConsts.tagRow, node[i], !0, columnMap);
                return xml + "\r\n<\/" + xmlNodeName + ">"
            },
            processRecord = function(nodeName, node, isRow, columnMap) {
                var xml = "<" + nodeName + ">",
                    nodeKeys = node ? Object.keys(node) : null,
                    len = node ? nodeKeys.length : 0,
                    nodeKey,
                    i;
                if (!isRow) {
                    var nameId = 0;
                    for (i = 0; i < len; i++)
                        nodeKey = nodeKeys[i],
                        isPrivateProperty(nodeKey) || columnMap[nodeKey] || (columnMap[nodeKey] = getUniqueExcelColumnName(nameId++))
                }
                for (typeInfo[typeIndex++] = {
                    tag: nodeName, type: "object", kind: node === null ? "null" : isRow ? "row" : "record", columnMap: reverseMap(columnMap)
                }, isRow || (xml += "\r\n" + processColumnMap(columnMap)), i = 0; i < len; i++)
                    if (nodeKey = nodeKeys[i], !isPrivateProperty(nodeKey)) {
                        var fieldName = columnMap[nodeKey];
                        var nodeValue = node[nodeKey];
                        xml += "\r\n" + processNode(fieldName, nodeValue)
                    }
                return xml + ("\r\n<\/" + nodeName + ">")
            };
        return {
                text: '<?xml version="1.0" encoding="utf-8"?>\r\n' + "<" + StringConsts.tagApplicationData + ' xmlns="urn:schemas-microsoft-com:siena"' + ' xmlns:ss="urn:schemas-microsoft-com:siena:appdata">\r\n' + processNode("data", root) + "\r\n<\/" + StringConsts.tagApplicationData + ">", assets: assets, typeInfo: typeInfo
            }
    }
    var isPrivateProperty = function(nodeKey) {
            var servicesProperties = AppMagic.Constants.Services;
            return nodeKey === runtimeConstants.collectionNameProperty || nodeKey === runtimeConstants.configurationProperty || nodeKey === runtimeConstants.metaProperty || nodeKey === runtimeConstants.syncVersionProperty || nodeKey === runtimeConstants.idProperty || nodeKey === runtimeConstants.controlLocMapProperty || nodeKey === servicesProperties.ID_PROPERTY || nodeKey === servicesProperties.SpIdProperty || nodeKey === servicesProperties.VERSION_PROPERTY ? !0 : !1
        };
    function xml2json(xml, impexId, schema) {
        var parsingStrategy = getParsingStrategy(impexId, schema);
        return parsingStrategy.parse({
                xml: xml, schema: schema
            })
    }
    function getParsingStrategy(impexId, schema) {
        return schema ? new Beta3XmlParsingStrategy(impexId) : new Beta2XmlParsingStrategy(impexId)
    }
    var XmlParsingStrategyBase = WinJS.Class.define(function XmlParsingStrategyBase_ctor(impexId) {
            this._impexId = impexId;
            this._stack = [];
            this._schemaStack = [];
            this._schemaIdx = 0;
            this._strict = !0;
            this._options = {
                trim: !0, normalize: !0, xmlns: !0, position: !0
            }
        }, {
            _stack: null, _schemaStack: null, _schemaIdx: null, _schema: null, _strict: null, _options: null, parse: function(data) {
                    var parser = sax.parser(this._strict, this._options);
                    return parser.onerror = this._onError.bind(this), parser.onopentag = this._onOpenTag.bind(this), parser.ontext = this._onText.bind(this), parser.onclosetag = this._onCloseTag.bind(this), parser.onend = this._onEnd.bind(this), parser.write(data.xml).close(), this._stack.pop()
                }, _onError: function(err) {
                    throw err.message;
                }, _onOpenTag: function(){}, _onText: function(text) {
                    /^ms-appdata:/g.test(text) || /^ms-appx:/g.test(text) ? this._stack.push(Core.Utility.formatString(text, this._impexId)) : this._stack.push(text)
                }, _onCloseTag: function(){}, _onEnd: function() {
                    if (this._stack.length !== 1)
                        throw"Unsupported format.";
                }
        }, {}),
        Beta2XmlParsingStrategy = WinJS.Class.derive(XmlParsingStrategyBase, function Beta2XmlParsingStrategy_ctor(impexId) {
            XmlParsingStrategyBase.call(this, impexId)
        }, {
            parse: function(data) {
                return XmlParsingStrategyBase.prototype.parse.call(this, data)
            }, _onOpenTag: function(node) {
                    var attr;
                    switch (node.name) {
                        case StringConsts.tagApplicationData:
                            break;
                        case StringConsts.tagTable:
                            this._stack.push([]);
                            break;
                        case StringConsts.tagRecord:
                        case StringConsts.tagRow:
                            this._stack.push({});
                            break;
                        case StringConsts.tagCell:
                            if (typeof(attr = node.attributes[StringConsts.attrName]) == "undefined")
                                throw"Unsupported format. All cells should be named.";
                            this._stack.push(attr.value);
                            break;
                        case StringConsts.tagData:
                            if (node.isSelfClosing)
                                this._stack.push(null);
                            else if (typeof(attr = node.attributes[StringConsts.attrType]) == "undefined")
                                throw"Unsupported format. All cells should be named.";
                            else
                                this._stack.push(attr.value);
                            break;
                        default:
                            throw"Unsupported format.";
                    }
                }, _onCloseTag: function(tag) {
                    var node,
                        x,
                        y;
                    switch (tag) {
                        case StringConsts.tagApplicationData:
                        case StringConsts.tagRecord:
                        case StringConsts.tagTable:
                            break;
                        case StringConsts.tagRow:
                            if (this._stack.length < 2 || typeof(x = this._stack.pop()) != "object" || !((node = this._stack[this._stack.length - 1]) instanceof Array))
                                throw"Unsupported format. Invalid table data.";
                            node.push(x);
                            break;
                        case StringConsts.tagCell:
                            if (this._stack.length < 3 || typeof(y = this._stack.pop()) == "undefined" || typeof(x = this._stack.pop()) != "string" || typeof(node = this._stack[this._stack.length - 1]) != "object")
                                throw"Unsupported format. Invalid row data.";
                            node[x] = y;
                            break;
                        case StringConsts.tagData:
                            if (this._stack.length < 2)
                                throw"Unsupported format. Invalid cell data.";
                            if (y = this._stack.pop(), y === null)
                                this._stack.push(y);
                            else if (typeof(x = this._stack.pop()) != "string")
                                throw"Unsupported format. Invalid data type.";
                            else
                                this._stack.push(this._convert(y, x));
                            break;
                        default:
                            throw"Unsupported format.";
                    }
                }, _convert: function(text, type) {
                    switch (type) {
                        case"string":
                            return unescape(text);
                        case"number":
                            if (text = parseFloat(text), typeof text == "number" && isFinite(text))
                                return text;
                            throw"Unsupported format. Invalid numeric value.";
                        case"boolean":
                            if (text === "true")
                                return !0;
                            if (text === "false")
                                return !1;
                            throw"Unsupported format. Invalid boolean value.";
                        default:
                            throw"Unsupported format. Invalid data type.";
                    }
                    return null
                }
        }, {}),
        Beta3XmlParsingStrategy = WinJS.Class.derive(XmlParsingStrategyBase, function Beta3XmlParsingStrategy_ctor(impexId) {
            XmlParsingStrategyBase.call(this, impexId)
        }, {
            parse: function(data) {
                return this._schema = data.schema, this._stack.push({schema: this._schema.tableSchema}), XmlParsingStrategyBase.prototype.parse.call(this, data)
            }, _onOpenTag: function(node) {
                    if (node.name !== StringConsts.tagApplicationData) {
                        var schemaInfo = this._schema[this._schemaIdx++];
                        this._schemaStack.push(schemaInfo);
                        var type = schemaInfo.type;
                        if (schemaInfo.tag !== node.name)
                            throw"Unsupported format. XML Tag does not match node name.";
                        this._stack.push(node.name);
                        this._stack.push(type);
                        node.isSelfClosing ? type === "string" ? this._stack.push("") : this._stack.push(null) : type === "array" ? this._stack.push([]) : type === "object" && this._stack.push(Object.create(null))
                    }
                }, _onCloseTag: function(tag) {
                    if (tag !== StringConsts.tagApplicationData) {
                        if (this._stack.length < 4)
                            throw"Unsupported format. Invalid data cell.";
                        var data = this._stack.pop(),
                            type = this._stack.pop(),
                            propName = this._stack.pop(),
                            node = this._stack[this._stack.length - 1];
                        if (typeof data == "undefined" || typeof type != "string" || typeof propName != "string" || typeof node != "object")
                            throw"Unsupported format. Invalid data cell.";
                        var schemaInfo = this._schemaStack.pop(),
                            isObject = tag === StringConsts.tagRow;
                        if (isObject)
                            switch (schemaInfo.kind) {
                                case"row":
                                    node.push(data);
                                    break;
                                case"record":
                                    this._stack.push(data);
                                    break;
                                case"header":
                                    break;
                                case"null":
                                    node.push(null);
                                    break;
                                default:
                                    throw"Unsupported format. Invalid type information.";
                            }
                        else if (this._schemaStack.length === 0)
                            node[propName] = this._convert(data, type);
                        else {
                            var fieldName = propName,
                                parentSchemaInfo = this._schemaStack[this._schemaStack.length - 1];
                            if (parentSchemaInfo.kind !== "header" && (fieldName = parentSchemaInfo.columnMap[propName], typeof fieldName != "string"))
                                throw"Unsupported format. Invalid type information.";
                            node[fieldName] = this._convert(data, type)
                        }
                    }
                }, _convert: function(text, type) {
                    switch (type) {
                        case"string":
                            return unescape(text);
                        case"number":
                            if (text = parseFloat(text), typeof text == "number" && isFinite(text))
                                return text;
                            throw"Unsupported format. Invalid numeric value.";
                        case"boolean":
                            if (text === "true")
                                return !0;
                            if (text === "false")
                                return !1;
                            throw"Unsupported format. Invalid boolean value.";
                        case"array":
                            return text === null ? [] : text;
                        case"object":
                            return text;
                        default:
                            throw"Unsupported format. Invalid data type.";
                    }
                    return null
                }
        }, {});
    WinJS.Namespace.define("AppMagic.Data", {
        json2xml: json2xml, xml2json: xml2json, createZip: createZip, loadZip: loadZip
    })
})(Windows);