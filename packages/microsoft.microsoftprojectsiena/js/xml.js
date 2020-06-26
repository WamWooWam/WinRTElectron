//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function() {"use strict";
    function xml2json(xmlString) {
        var strict = !0,
            opts = {
                trim: !0, normalize: !0, xmlns: !0, position: !0
            },
            stack = [],
            root,
            cur,
            parser = sax.parser(strict, opts);
        return parser.onerror = function(err) {
                throw new Error(Core.Utility.formatString(AppMagic.Strings.XmlParsingError, err.message));
            }, parser.onopentag = function(node) {
                var n = {},
                    v = typeof cur != "undefined" ? cur[node.name] : cur;
                typeof v == "undefined" ? v = n : (v instanceof Array || (v = [v]), v.push(n));
                for (var attrNames = Object.keys(node.attributes), alen = attrNames.length, attrs = {}, i = 0; i < alen; i++) {
                    var attr = node.attributes[attrNames[i]];
                    attr.prefix !== "xmlns" && attr.name !== "xmlns" && (attrs[attr.name] = attr.value)
                }
                n.$name = node.name;
                n.$ns = JSON.parse(JSON.stringify(node.ns));
                n.$attributes = attrs;
                typeof root == "undefined" ? root = cur = n : (cur[node.name] = v, stack.push(cur), cur = n)
            }, parser.oncdata = function(data) {
                    typeof cur.$text == "undefined" ? cur.$text = data : cur.$text += data
                }, parser.ontext = function(text) {
                    typeof cur.$text == "undefined" ? cur.$text = text : cur.$text += text
                }, parser.onclosetag = function(tag) {
                    cur = stack.pop()
                }, parser.onend = function(){}, parser.write(xmlString).close(), root
    }
    function json2xml(root, omitHeader) {
        var processNode = function(node) {
                var i,
                    len,
                    xml = "<" + node.$name;
                if (typeof node.$ns != "undefined") {
                    var nsList = node.$ns,
                        nsPrefixes = Object.keys(nsList);
                    for (i = 0, len = nsPrefixes.length; i < len; i++) {
                        var prefix = nsPrefixes[i];
                        xml += " xmlns";
                        prefix !== "" && (xml += ":" + prefix);
                        xml += '="' + AppMagic.Utility.escapeXmlString(nsList[prefix]) + '"'
                    }
                }
                if (typeof node.$attributes != "undefined") {
                    var attrList = node.$attributes,
                        attrNames = Object.keys(attrList);
                    for (i = 0, len = attrNames.length; i < len; i++) {
                        var attrName = attrNames[i];
                        xml += " " + attrName + '="' + AppMagic.Utility.escapeXmlString(attrList[attrName]) + '"'
                    }
                }
                xml += ">";
                typeof node.$text == "string" && (xml += AppMagic.Utility.escapeXmlString(node.$text));
                var nodeKeys = Object.keys(node);
                for (i = 0, len = nodeKeys.length; i < len; i++) {
                    var nodeKey = nodeKeys[i];
                    if (nodeKey.charAt(0) !== "$") {
                        var nodeValue = node[nodeKey];
                        if (nodeValue instanceof Array)
                            for (var j = 0, jlen = nodeValue.length; j < jlen; j++)
                                xml += processNode(nodeValue[j]);
                        else
                            xml += processNode(nodeValue)
                    }
                }
                return xml + ("<\/" + node.$name + ">")
            },
            header = omitHeader ? "" : '<?xml version="1.0" encoding="utf-8"?>';
        return header + processNode(root)
    }
    WinJS.Namespace.define("AppMagic.Services", {
        xml2json: xml2json, json2xml: json2xml
    })
})();