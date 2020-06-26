//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    var SUFFIX_SEPARATOR = "_",
        RType = {
            authRequest: 0, error: 1, item: 2, set: 3, pagedSet: 4
        };
    function createAuth(id, providerName, config) {
        return {
                type: RType.authRequest, id: id, provider: providerName, config: config
            }
    }
    function createError(msg) {
        return {
                type: RType.error, message: msg || ""
            }
    }
    function correctSchemaDictionaryAndCreateNameRemapping(schemaDictionary) {
        for (var nameRemapping = Object.create(null), columnNames = Object.keys(schemaDictionary).sort(), i = 0, len = columnNames.length; i < len; i++) {
            var originalColName = columnNames[i],
                schemaItem = schemaDictionary[originalColName],
                valid = originalColName.length === 0 ? "_" : AppMagic.Utility.replaceAllSingleOrDoubleQuotes(originalColName, "_");
            if (valid !== originalColName) {
                for (var nameToTry = valid, suffix = 0; typeof schemaDictionary[nameToTry] != "undefined"; )
                    suffix++,
                    nameToTry = valid + SUFFIX_SEPARATOR + suffix.toString();
                valid = nameToTry;
                schemaItem.name = nameToTry;
                schemaDictionary[nameToTry] = schemaItem;
                delete schemaDictionary[originalColName]
            }
            nameRemapping[originalColName] = {name: valid};
            schemaItem.ptr && (nameRemapping[originalColName].childMapping = correctSchemaDictionaryAndCreateNameRemapping(schemaItem.ptr))
        }
        return nameRemapping
    }
    function correctTableWithSchema(rows, schemaDictionary, nameRemapping) {
        for (var j, jlen, i = 0, len = rows.length; i < len; i++) {
            var row = rows[i];
            row !== null && ((typeof row != "object" || row instanceof Array) && (row = {Value: row}, rows[i] = row), correctRowWithSchema(row, schemaDictionary, nameRemapping))
        }
    }
    function correctRowWithSchema(row, schemaDictionary, nameRemapping) {
        if (row !== null)
            for (var itemKeys = Object.keys(row), j = 0, jlen = itemKeys.length; j < jlen; j++) {
                var itemKey = itemKeys[j],
                    itemValue = row[itemKey],
                    schemaItem = schemaDictionary[nameRemapping[itemKey].name];
                switch (schemaItem.type) {
                    case"array":
                        itemValue !== null && (itemValue instanceof Array || (row[itemKey] = [itemValue]), correctTableWithSchema(row[itemKey], schemaItem.ptr, nameRemapping[itemKey].childMapping));
                        break;
                    case"s":
                        typeof itemValue != "string" && itemValue !== null && (row[itemKey] = JSON.stringify(itemValue));
                        break;
                    case"object":
                        correctRowWithSchema(row[itemKey], schemaItem.ptr, nameRemapping[itemKey].childMapping);
                        break
                }
                if (itemValue = row[itemKey], nameRemapping[itemKey].name !== itemKey) {
                    var newName = nameRemapping[itemKey].name;
                    row[newName] = itemValue;
                    delete row[itemKey]
                }
            }
    }
    function createFlattenedSchemaAndCorrectDataIfNecessary(data) {
        var schemaDictionary = AppMagic.Utility.createInferredSchemaFromArray(data),
            nameRemapping = correctSchemaDictionaryAndCreateNameRemapping(schemaDictionary);
        return correctTableWithSchema(data, schemaDictionary, nameRemapping), AppMagic.Utility.flattenSchema(schemaDictionary)
    }
    function createSet(items, schema) {
        return schema || (schema = createFlattenedSchemaAndCorrectDataIfNecessary(items)), {
                type: RType.set, items: items, schema: schema
            }
    }
    function createPagedSet(items, index, count, schema) {
        return schema || (schema = createFlattenedSchemaAndCorrectDataIfNecessary(items)), {
                type: RType.pagedSet, items: items, top: index, count: count, schema: schema
            }
    }
    WinJS.Namespace.define("AppMagic.Services.Results", {
        Type: RType, correctArrayWithSchema: correctTableWithSchema, correctObjectWithSchema: correctRowWithSchema, correctSchemaDictionaryAndCreateNameRemapping: correctSchemaDictionaryAndCreateNameRemapping, createAuth: createAuth, createError: createError, createSet: createSet, createPagedSet: createPagedSet
    })
})();