
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js" />
/// <reference path="../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../Shared/JSUtil/Include.js"/>
/// <reference path="../../../Shared/Jx/Core/Debug.js"/>
/// <reference path="../../../Shared/Jx/Core/Jx.js"/>
/// <reference path="../../../Shared/Jx/Core/Res.js"/>
/// <reference path="./uimenu.js"/>
/// <reference path="./uiform-refs.js"/>
/// <reference path="./UiFormAddressInputControl.js"/>
/// <reference path="./UiFormTextInputControl.js"/>
/// <reference path="./UiFormSelectInputControl.js"/>
/// <reference path="./UiFieldRenderers.js"/>

/// <disable>JS2034.DoNotCompareToTrueOrFalse</disable>

Jx.delayDefine(People, "UiForm", function () {
    
    var P = window.People;

    function perfUiFormAction(actionOp, actionFunc) {
        return function () {
            try {
                NoShip.People.etw("uiform_start", { action: actionOp });

                return actionFunc.apply(this, arguments);
            } finally {
                NoShip.People.etw("uiform_end", { action: actionOp });
            }
        };
    };

    var resourceContext = /* @type(String) */null;
    function _getMarket() {
        if (!resourceContext) {
            resourceContext = new P.LocaleHelper();
        }
        return resourceContext;
    };

    var _formFieldError = {
        _getErrorDiv: function (uiform, fieldName, fieldMap, createMissing) {
            /// <param name="uiform" type="People.UiForm" />
            /// <param name="fieldName" type="String" />
            /// <param name="fieldMap" type="_UiFormFieldMap" />
            /// <param name="createMissing" type="Boolean" />
            if (!fieldMap) {
                return null;
            }
            var errorDiv = fieldMap.errorDiv;
            if (errorDiv) {
                return errorDiv;
            }
            if (!createMissing) {
                return null;
            }
            errorDiv = /* @static_cast(HTMLElement) */document.createElement('div');
            errorDiv.id = 'errorDiv_' + fieldName;
            _addCssStyle(uiform, errorDiv, "fieldError");
            fieldMap.errorDiv = errorDiv;

            var parentNode = fieldMap.container;
            if (Boolean(parentNode) && parentNode.childNodes.length > 0) {
                parentNode.insertBefore(/* @static_cast(Node) */errorDiv, parentNode.childNodes[0]);
            } else {
                parentNode.appendChild(/* @static_cast(Node) */errorDiv);
            }

            return errorDiv;
        },
        clear: function (/* @type(People.UiForm) */uiform, fieldName, /* @type(_UiFormFieldMap) */fieldMap) {
            fieldMap.errorState = false;
            var container = fieldMap.container;
            this.hide(uiform, fieldName, fieldMap);
        },

        setError: function (/* @type(People.UiForm) */uiform, fieldName, fieldMap, message) {

            var errorDiv = this._getErrorDiv(uiform, fieldName, fieldMap, true);
            if (errorDiv) {
                errorDiv.innerText = message;
                _show(errorDiv);
                // Until we have a better solution, we'll hook the edit container resize check into these methods
                uiform._onFormChanged();
            }
        },

        hide: function (/* @type(People.UiForm) */uiform, fieldName, fieldMap) {
            var errorDiv = this._getErrorDiv(uiform, fieldName, fieldMap, false);
            if (errorDiv) {
                errorDiv.innerText = '';
                _hide(errorDiv);
                // Until we have a better solution, we'll hook the edit container resize check into these methods
                uiform._onFormChanged();
            }
        }
    };

    // ----------------------------------------------------------------------------------------------------.
    // Common internal helper functions hidden from the outside world by the closure.
    // ----------------------------------------------------------------------------------------------------.
    /// <summary>
    /// Encodes a string to be displayed in the browser.
    /// Usage: _divElement.innerHTML =_someValue.encodeHtml());
    /// </summary>
    /// <returns>Encode Xml/Html</returns>
    function _encodeHtml(value) {
        /// <param name="value" type="String" />
        if (value) {
            var div = document.createElement('tempDiv');
            var text = document.createTextNode(value);
            div.appendChild(text);
            value = div.innerHTML;
        }
        return value;
    };

    function _trim(value) {
        /// <param name="value" type="String" />
        if (value) {
            return value.replace(/^\s+|\s+$/g, '');
        }
        return value;
    };

    function _isEmpty(field) {
        /// <param name="field" type="String" />
        if (Boolean(field) && field.length > 0) {
            return false;
        }
        return true;
    };


    // ----------------------------------------------------------------------------------------------------

    function _typeof(value) {
        /// <summary>
        /// A helper function to identify the underlying type object correctly.
        /// </summary>
        /// <returns>Builtin type results: number, string, undefined, null, object, function, array, date, regexp, error</returns>

        if (typeof value !== 'object') {
            return typeof value;
        }

        if (value === null) {
            return "null";
        }

        // Identify objects types.
        // object, array, function, date, regexp, string, number, boolean, error 
        return ({}).toString.call(value).match(/\[object\s([\w\.]+)\]/)[1].toLowerCase();
    }

    function _assignFieldValue(/*@dynamic*/target, fieldName, /* @dynamic */value) {
        /// <param name="fieldName" type="String" />
        /// <param name="value" type="Object" />

        var valueType = _typeof(value);
        var targetObj = value;

        // ========== DELETE THIS WHEN FIXING TRACKING BUG (BEGIN) ==========.
        // Shortcut method for most fields.
        // Note: There's a bug in WLComm M1 (tracking #407953) that causes a null field assignment to instead
        //   set the value of the field to the string "NULL".  For now, we'll trap the
        //   null assignments and make an attempt to assign a reasonable default value.
        //   When this bug is fixed then the line below can be uncommented out and the
        //   block that follows should be deleted.
        // Remark: Even if the bug is fixed, updating to reflect the fix may no longer be
        //   as simple, due to recent changes in dealing with complex objects. -ankim
        // target[fieldName] = value;
        if (value === null) {
            switch (_typeof(target[fieldName])) {
                case "number":
                    targetObj = 0;
                    break;
                case "boolean":
                    ///<disable>JS3057.AvoidImplicitTypeCoercion</disable>
                    targetObj = false;
                    break;
                case "object":
                    // Nothing as code below will call back into this method, should also never occur
                    break;
                case "function":
                    // Do Nothing
                    break;
                case "microsoft.windowslive.platform.location":
                    // Special case: if address field is left unexpanded, save will fail since
                    //   we assign an empty string to a complex object field. The code below
                    //   fixes the issue for now. Note that this piece of code will have to
                    //   remain even after the WLComm bug mentioned above is fixed.
                    valueType = "object";
                    value = { street: "", city: "", state: "", zipCode: "", country: "" };
                    break;
                default:
                    targetObj = "";
                    break;
            }
        }
        // ========== DELETE THIS WHEN FIXING TRACKING BUG (END) ==========


        if (valueType === "object") {
            targetObj = target[fieldName] || {};
            for (var fName in value) {
                _assignFieldValue(targetObj, fName, value[fName]);
            }
        }
        if (valueType === "array") {
            var targetArr = /* @static_cast(Array) */target[fieldName] || [];
            var len = value.length;
            for (var lp = 0; lp < len; lp++) {
                targetArr.push(value[lp]);
            }
            targetObj = targetObj;
        }
        target[fieldName] = targetObj;

        return;
    };

    ////var _getString = perfUiFormAction("getString", _getStringX);
    function _getString(uiform, baseResourceName, fieldName, locId) {
        /// <summary>
        /// Load a resource string and replace the {%#} with the values passed in
        /// (this function accepts variable number of parameters, param2-n are the replacement values)
        /// </summary>
        /// <param name="uiform" type="People.UiForm" />
        /// <param name="baseResourceName" type="String">the base resource name for the resource string</param>
        /// <param name="fieldName" type="String" optional="true">the fieldname to be added to the base resource name</param>
        /// <param name="locId" type="String" optional="true">an override for the default locId</param>

        var checkBase = false;
        var resourceId = uiform._residPrefix + baseResourceName;
        var fieldResourceId = resourceId;
        if (fieldName) {
            fieldResourceId = resourceId + "_" + fieldName;
            checkBase = true;
        }
        if (locId) {
            fieldResourceId = locId;
        }

        var str = null;

        if (!uiform._loc) {
            // If no Localizer has been passed in then return a string with the passed values,
            // useful for identifying strings that have not been defined and for testing.
            // Format: '{resourceid}#{arg0};{arg1};{argX}'.
            str = '{' + fieldResourceId + '}#';
            if (arguments.length > 4) {
                str += ' ';
                for (var i = 4; i < arguments.length; i++) {
                    str += ('{' + arguments[i] + '};');
                }
            }
            return str;
        }

        
        // This code intentionally attempts to load resource strings that don't exist.
        // Inhibit the assert in the IE resource loading code that results.
        var oldAssert = Debug.assert;
        Debug.assert = Jx.fnEmpty;
        

        str = uiform._loc.getString(fieldResourceId);
        if (checkBase && !Jx.isNonEmptyString(str)) {
            str = uiform._loc.getString(resourceId);
        }

        
        Debug.assert = oldAssert;
        

        
        if (str === null) {
            // No Resource String present, using a default
            str = "{#" + fieldResourceId + "}";
        }
        

        if (str) {
            if (arguments.length > 4) {
                for (var idx = 4; idx < arguments.length; idx++) {
                    var rx2 = new RegExp("%" + String(idx - 3), "g");
                    str = str.replace(rx2, arguments[idx]);
                }
            }
        }
        return str;
    };

    function _canDisplayField(fieldAttr, fieldName, fieldValue) {
        /// <summary>
        /// Determines whether a field can be displayed, the 'display' value can be true/false or a function, this is used
        /// to enable or disable a field completely, based on criteria like server supplied value (true/false) or the 
        /// market we are running in and whether the field is available.
        /// </summary>
        /// <param name="fieldAttr" type="_UiFormFieldAttrib" />
        /// <param name="fieldName" type="String" />
        /// <param name="fieldValue" type="Object" />
        if (fieldAttr.display) {
            if (typeof fieldAttr.display === 'function') {
                return fieldAttr.display(fieldAttr, fieldValue);
            }
            return fieldAttr.display;
        }

        return true;
    };

    function _mustEditField(fieldAttr, fieldName) {
        /// <summary>
        /// Determines whether a field must always be displayed for editing, the 'mustEdit' value can be true/false or a function, this is used
        /// to display a field for editing by default if it does not contain a value, based on criteria like server supplied value (true/false) or the 
        /// market we are running in and whether the field is available.
        /// </summary>
        /// <param name="fieldAttr" type="_UiFormFieldAttrib" />
        /// <param name="fieldName" type="String" />
        /// <param name="fieldValue" type="Object" />
        if (fieldAttr.mustEdit) {
            if (typeof fieldAttr.mustEdit === 'function') {
                return fieldAttr.mustEdit(fieldAttr);
            }
            return fieldAttr.mustEdit;
        }

        return false;
    };

    function _getCssClass(uiform, styleName) {
        /// <param name="uiform" type="People.UiForm" />
        /// <param name="styleName" type="String" />
        if (uiform._cssPrefix) {
            return uiform._cssPrefix + styleName;
        }
        return styleName;
    };

    function _applyCssStyle(uiform, target, referenceName) {
        /// <summary>
        /// Find and apply the Css Class and styles defined for the given type
        /// </summary>
        /// <param name="uiform" type="People.UiForm" />
        /// <param name="target" type="HTMLElement" />
        /// <param name="referenceName" type="String" />

        Jx.addClass(target, _getCssClass(uiform, referenceName));
    };

    function _addCssStyle(uiform, target, referenceName) {
        /// <summary>
        /// Find and apply the Css Class and styles defined for the given type, the different between
        /// the _applyCssStyle and _addCssStyle is 2 fold.
        /// 1. This assumes that the style does not already exist
        /// 2. It's a LOT faster because Jx.addClass() checks for existence which is slow!
        /// </summary>
        /// <param name="uiform" type="People.UiForm" />
        /// <param name="target" type="HTMLElement" />
        /// <param name="referenceName" type="String" />

        var newClassName = _getCssClass(uiform, referenceName);
        target.className += " " + newClassName;
    };

    function _show(target) {
        /// <param name="target" type="HTMLElement" />
        target.setAttribute("aria-hidden", "false");
        Jx.removeClass(target, "uiform-hide");
    };

    function _hide(target) {
        /// <param name="target" type="HTMLElement" />
        target.setAttribute("aria-hidden", "true");
        Jx.addClass(target, "uiform-hide");
    };
    ////var _renderField = perfUiFormAction("_renderField", _renderFieldX);
    function _renderField(uiform, groupData, fieldName, fieldAttr, fieldValue, fieldNetwork, uniqueFields) {
        ///<param name="uiform" type="People.UiForm" />
        ///<param name="groupData" type="HTMLElement" />
        ///<param name="fieldName" type="String" />
        ///<param name="fieldAttr" type="_UiFormFieldAttrib" />
        ///<param name="fieldValue" type="Object" />
        ///<param name="fieldNetwork" type="String" />
        ///<param name="uniqueFields" type="Array" />
        if (Boolean(fieldValue) && _canDisplayField(fieldAttr, fieldName, fieldValue)) {
            var formatFieldNetwork = null;
            var renderField = true;

            if (uniqueFields) {
                var showItem = P.UiForm.showItem(uniqueFields, fieldName, fieldAttr, fieldValue, fieldNetwork);
                if (showItem.exists && !showItem.item.hasDisplayed) {
                    formatFieldNetwork = showItem.item.fieldNetwork;
                    showItem.item.hasDisplayed = true;
                } else {
                    renderField = false;
                }
            }
            if (renderField) {
                var fieldDiv = uiform._viewFormatter.formatField(fieldName, fieldAttr, fieldValue, formatFieldNetwork);
                if (fieldDiv) {
                    groupData.appendChild(/* @static_cast(Node) */fieldDiv);
                    return true;
                }
            }
        }
        return false;
    };

    function _getChatFieldValue(uiform, /* @type(Array) */contacts) {
        // <param name="uiform" type="People.UiForm" />
        var values = "";
        var hasWLEmail = false;
        var hasMobile = false;
        var imEndpoints = [];
        var first = true;

        var i;
        for (i = 0; i < contacts.length; i++) {
            var contact = /* @static_cast(Microsoft.WindowsLive.Platform.Contact) */contacts[i];

            var imType = contact.imtype;

            /// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
            if ((imType !== Microsoft.WindowsLive.Platform.ContactIMType.foreignNetwork) && (imType !== Microsoft.WindowsLive.Platform.ContactIMType.none)) {
                hasWLEmail = true;
            }

            if (contact.mobilePhoneNumber !== "") {
                hasMobile = true;
            }

            if ((Microsoft.WindowsLive.Platform.ContactIMType.foreignNetwork === imType) && Boolean(contact.account)) {
                imEndpoints.push(contact.account.displayName);
            }
        }

        if (hasWLEmail) {
            imEndpoints.push(_getString(uiform, "", null, "Messenger"));
        }

        /*** Bug 450677 Chat app does not support SMS in M2. Remove comment and enable code in M3
        if (hasMobile) {
        imEndpoints.push(_getString(uiform, "", null, "SMS"));
        }

        ******/

        for (i = 0; i < imEndpoints.length; i++) {
            if (!first) {
                values += ", ";
            }
            values += imEndpoints[i];
            first = false;
        }

        return values;
    };

    P.UiForm = UiForm;
    /* @constructor */function UiForm(formData) {
        ///<param name="formData" type="_UiFormFormData" />
        Debug.assert(formData);

        this._formData = formData;
        this.fieldList = formData.fieldList || null;
        this.groupList = formData.groupList || null;
        this._loc = /* @static_cast(Jx.Res) */formData.loc || null;
        this._fieldMap = /* @dynamic */{};
        this._groupMap = /* @dynamic */{};
        this._cssPrefix = formData.cssPrefix || "uiform-";
        this._residPrefix = formData.residPrefix || "";
        this._sourceData = /* @dynamic */null;
        this._onFormChanged = formData.onFormChanged || function () {};
    };
    P.UiForm.prototype = {
        /*@dynamic*/_formData: null,
        /*@dynamic*/fieldList: null,
        /*@type(Jx.Res)*/_loc: null,
        /*@dynamic */_fieldMap: null,
        /*@dynamic*/_groupMap: null,
        /*@type(String)*/_cssPrefix: null,
        /*@dynamic */_sourceData: null,
        /*@type(_UiFormViewFormatter)*/_viewFormatter: null,
        /*@type(HTMLElement)*/_formErrorDiv: null,
        /*@type(HTMLElement)*/_formErrorHeader: null,
        /*@type(HTMLElement)*/_formErrorBody: null
    };

    
    P.UiForm.__class = true;
    

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var UiFormPrototype = P.UiForm.prototype;
    UiFormPrototype.groupList = /*@dynamic*/null;

    UiFormPrototype.setCssStyle = function (element, styleName) {
        /// <param name="element" type="HTMLElement" />
        /// <param name="styleName" type="String" />

        _applyCssStyle(this, element, styleName);
    };

    UiFormPrototype.getString = function (baseName, fieldName, locId) {
        /// <param name="baseName" type="String" />
        /// <param name="fieldName" type="String" />
        /// <param name="locId" type="String" optional="true" />

        return _getString(this, baseName, fieldName, locId);
    };

    P.UiForm.isEmptyString = function (value) {
        ///<summary>
        /// Checks to see whether the provided string is null, undefined or an empty string and returns true for
        /// all of these cases. Otherwise, returns false it is not a string or has a value.
        ///</summary>
        ///<param name="value" type="String" />

        if (Jx.isNullOrUndefined(value)) {
            return true;
        }
        if (typeof value === "string" && _trim(value).length === 0) {
            return true;
        }
        return false;
    };

    P.UiForm.getMarket = _getMarket;
    P.UiForm.trim = _trim;
    P.UiForm.isEmpty = _isEmpty;
    P.UiForm.encodeHTML = _encodeHtml;

    UiFormPrototype.getCssClass = function (styleName) {
        return _getCssClass(this, styleName);
    };

    function _createGroupTitle(uiform, container, groupLabel) {
        ///<param name="uiform" type="People.UiForm" />
        ///<param name="container" type="HTMLElement" />
        ///<param name="groupLabel" type="String" />
        var titleDiv = /* @static_cast(HTMLElement) */document.createElement('div');
        _addCssStyle(uiform, titleDiv, "groupTitle");
        titleDiv.id = "groupTitle_" + container.id;
        titleDiv.setAttribute('aria-label', groupLabel);
        titleDiv.setAttribute('role', "columnheader");

        titleDiv.innerText = groupLabel;

        container.appendChild(/* @static_cast(Node) */titleDiv);
    };

    function _viewFormatter(uiform, uniqueFields, formData) {
        // The field formatter to use for formatting the fields
        return {
            formatField: function (fieldName, fieldAttr, value, fieldNetwork) {
                ///<param name="fieldName" type="String" />
                ///<param name="fieldAttr" type="_UiFormFieldAttrib" />
                ///<param name="value" type="Object" />
                ///<param name="fieldNetwork" type="String" />
                var formatter = P.UiFormRenderers.getRenderer(fieldAttr.type);

                displayValue = value;

                var fieldDiv = /* @static_cast(HTMLElement) */document.createElement('div');
                fieldDiv.id = 'fieldDiv_' + fieldName;
                _addCssStyle(uiform, fieldDiv, "fieldContainer");

                var fieldValueDiv = /* @static_cast(HTMLElement) */document.createElement('div');
                fieldValueDiv.id = 'fieldValueDiv_' + fieldName;
                _addCssStyle(uiform, fieldValueDiv, "fieldValue");

                var fieldNameString = _getString(uiform, 'fieldTitle', fieldName, fieldAttr.locId);
                if (formatter.field(uiform, fieldValueDiv, displayValue, fieldNameString)) {

                    var fieldTitleDiv = /* @static_cast(HTMLElement) */document.createElement('div');
                    fieldTitleDiv.id = 'fieldTitleDiv_' + fieldName;
                    fieldTitleDiv.innerText = fieldNameString;
                    _addCssStyle(uiform, fieldTitleDiv, "fieldTitle");

                    if (fieldAttr.active === true) {
                        fieldValueDiv.setAttribute('role', "link");
                    }

                    fieldDiv.appendChild(/* @static_cast(Node) */fieldValueDiv);
                    fieldDiv.appendChild(/* @static_cast(Node) */fieldTitleDiv);

                    if (uniqueFields) {
                        if ((fieldAttr.type !== "email") && P.UiForm.containsMultiple(uniqueFields, fieldName)) {
                            var fieldAttributionDiv = /* @static_cast(HTMLElement) */document.createElement('div');
                            fieldAttributionDiv.id = 'fieldAttributionDiv_' + fieldName;
                            _addCssStyle(uiform, fieldAttributionDiv, "fieldAttribution");
                            var fieldNetworkUnique = [];
                            var fieldNetworkString = "";
                            for (var i = 0; i < fieldNetwork.length; i++) {
                                if (fieldNetworkUnique.indexOf(fieldNetwork[i]) === -1) {
                                    fieldNetworkUnique.push(fieldNetwork[i]);
                                    if (i > 0) {
                                        fieldNetworkString += ", ";
                                    }
                                    fieldNetworkString += fieldNetwork[i];
                                }
                            }
                            fieldAttributionDiv.innerText = fieldNetworkString;
                            fieldDiv.appendChild(/* @static_cast(Node) */fieldAttributionDiv);
                        }
                    }

                    if (formatter.section) {
                        P.Animation.addPressStyling(fieldValueDiv);
                        return formatter.section(uiform, fieldDiv, fieldValueDiv, fieldAttr, value, fieldNameString, displayValue);
                    }
                    return fieldDiv;
                }
                return null;
            }
        };
    };

    UiFormPrototype.createViewForm = perfUiFormAction("createViewForm", function (container, /* @dynamic */formData, uniqueFields) {
        /// <summary>
        /// Render the formData object for viewing using the provided field / group definition to 
        /// process the formData
        /// </summary>
        /// <param name="container" type="HTMLElement" optional="false">
        /// This is the container where the value should be rendered for display
        /// </param>
        /// <param name="formData" type="Object" optional="false">
        /// This is the object that contains the information to be rendered. The value may be either a "normal" object 
        /// or an Array of object, in the case of an Array this will be treated as "multiple" instances of the "normal"
        /// object which will be rendered.
        /// </param>
        // <param name="uniqueFields" type="Array" />


        _applyCssStyle(this, container, "container");
        this._viewFormatter = _viewFormatter(this, uniqueFields, formData);
        this._sourceData = formData;

        var isArray = (formData && formData instanceof Array ? true : false);

        var groupNum = 0;
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        var groupList = /* @dynamic*/this.groupList;
        for (var groupName in groupList) {
            var group = groupList[groupName];
            var groupData = /* @static_cast(HTMLElement) */document.createElement('div');
            groupData.id = 'groupData_' + groupName;
            _addCssStyle(this, groupData, "groupFields");

            var addGroup = false;

            for (var i = 0; i < group.fieldList.length; i++) {

                var fieldName = group.fieldList[i];
                var fieldAttr = this.fieldList[fieldName];
                var network = "";
                var sourceId = "";

                var canView = !(fieldAttr.canView === false) && !(group.canView === false);
                if (canView && formData) {
                    var fieldValue = null;
                    if (fieldAttr.type === "chat") {
                        fieldValue = _getChatFieldValue(this, formData);
                        /// <disable>JS3057.AvoidImplicitTypeCoercion</disable>
                        if (_renderField(this, groupData, fieldName, fieldAttr, fieldValue, network, null)) {
                            addGroup = true;

                        }
                    } else if (isArray) {
                        for (var lp = 0; lp < formData.length; lp++) {
                            var data = formData[lp];
                            fieldValue = null;
                            network = "";
                            if (data) {
                                sourceId = data.account ? data.account.sourceId : "";
                                fieldValue = P.Contact.getFieldValue(data, fieldName, sourceId);
                                if ((data.account !== undefined) && (data.account !== null)) {
                                    if (data.canEdit && data.account.isDefault) {
                                        // ABCH contact
                                        network = Jx.res.getString("/strings/profile_fieldAttribution_addedByYou");
                                    } else {
                                        network = data.account.displayName;
                                    }
                                }
                            }
                            if (_renderField(this, groupData, fieldName, fieldAttr, fieldValue, network, uniqueFields)) {
                                addGroup = true;
                            }
                        }
                    } else {
                        network = "";
                        if (data) {
                            if ((data.account !== undefined) && (data.account !== null)) {
                                network = data.account.displayName;
                                sourceId = data.account.sourceId;
                            }
                        }
                        if (_renderField(this, groupData, fieldName, fieldAttr, P.Contact.getFieldValue(formData, fieldName, sourceId), network, uniqueFields)) {
                            addGroup = true;
                        }
                    }
                }
            }

            // Assemble the group div
            if (addGroup) {
                var groupDiv = /* @static_cast(HTMLElement) */document.createElement('div');
                groupDiv.id = 'groupDiv_' + groupName;
                _addCssStyle(this, groupDiv, "groupContainer");

                _createGroupTitle(this, groupDiv, _getString(this, 'groupTitle', groupName, group.locId));
                groupDiv.appendChild(/* @static_cast(Node) */groupData);
                container.appendChild(/* @static_cast(Node) */groupDiv);
            }
        }
    });


    // Returns true if the specified item in the specified network should be displayed in the UI, false otherwise.
    P.UiForm.showItem = function (uniqueFields, fieldName, fieldAttr, fieldValue, network) {
        /// <param name="uniqueFields" type="Array" />
        /// <param name="fieldName" type="String" />
        /// <param name="fieldAttr" type="_UiFormFieldAttrib" />
        /// <param name="fieldValue" type="Object" />
        /// <param name="network" type="String" />
        /// <returns type="_UiFormShowItem" />
        for (var i = 0; i < uniqueFields.length; i++) {
            var curr = /* @static_cast(_ContactUniqueField) */uniqueFields[i];
            if (fieldAttr.type === "mapLocation") {
                if ((curr.fieldName === fieldName) &&
                    (curr.fieldNetwork.indexOf(network) > -1) &&
                    (P.Location.compare(curr.fieldValue, fieldValue) === P.Compare.equal)) {
                    return { exists: true, item: curr };
                }
            } else if ((curr.fieldName === fieldName) &&
                (curr.fieldValue === fieldValue) &&
                (curr.fieldNetwork.indexOf(network) > -1)) {
                return { exists: true, item: curr };
            }
        }

        return { exists: false, item: null };
    };

    // Returns true if there are multiple fields for the same fieldname (From different sources) 
    P.UiForm.containsMultiple = function (uniqueFields, fieldName) {
        /// <param name="uniqueFields" type="Array(_ContactUniqueField)" />
        /// <param name="fieldName" type="String" />
        var count = 0;
        for (var i = 0; i < uniqueFields.length; i++) {
            if (uniqueFields[i].fieldName === fieldName) {
                count++;
            }
        }

        if (count > 1) {
            return true;
        } else {
            return false;
        }
    };

    var _abchSourceIds = {
        WL: true,
        ABCH: true
    };

    function _isAbchContact(uiform) {
        var sourceId = "ABCH";
        var target = uiform._sourceData;
        if (target && target.account) {
            sourceId = target.account.sourceId || sourceId;
        }

        if (_abchSourceIds[sourceId]) {
            return true;
        }

        return false;
    };

    P.UiForm.Validators = {
        _required: function (/*@dynamic*/fieldValue, fieldAttrib, uiform) {
            /// <param name="fieldAttrib" type="_UiFormFieldAttrib" />
            /// <param name="uiform" type="People.UiForm" />
            if (!fieldValue) {
                return false;
            }
            return _trim(fieldValue) !== '';
        },

        _emailAddress: function (/*@dynamic*/fieldValue, fieldAttrib, uiform) {
            /// <param name="fieldValue" />
            /// <param name="fieldAttrib" type="_UiFormFieldAttrib" />
            /// <param name="uiform" type="People.UiForm" />
            /*$ var regexp = new RegExp("^[-_a-z0-9\'+*$^&%=~!?{}]++(?:\.[-_a-z0-9\'+*$^&%=~!?{}]+)*+@(?:(?![-.])[-a-z0-9.]+(?<![-.])\.[a-z]{2,6}|\d{1,3}(?:\.\d{1,3}){3})(?::\d++)?$");
            (!fieldValue.match("^[-a-zA-Z0-9~!$%^&*_=+}{\'?]+(\.[-a-zA-Z0-9~!$%^&*_=+}{\'?]+)*@([a-zA-Z0-9_][-a-zA-Z0-9_]*(\.[-a-zA-Z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$"))) {*/
            if (_isAbchContact(uiform)) {
                if ((fieldValue !== '') && (!fieldValue.match(/*@static_cast(RegExp)*/"^.*[@]+.*[\.]+.*$"))) {
                    return false;
                }
                // restrict ABCH storage to ASCII only characters
                if ((fieldValue !== '') && (!fieldValue.match(/*@static_cast(RegExp)*/"^[\x20-\x7f]*$"))) {
                    return false;
                }
                return true;
            }
            if ((fieldValue !== '') && (!fieldValue.match(/*@static_cast(RegExp)*/"^.*[@]+.*[\.]+.*$"))) {
                // Return failure as warning only
                return null;
            }
            return true;
        },

        _mobile: function (/*@dynamic*/fieldValue, fieldAttrib, uiform) {
            /// <param name="fieldAttrib" type="_UiFormFieldAttrib" />
            /// <param name="uiform" type="People.UiForm" />
            // Phone Numbers can only contain characters : A-Z a-z, 0-9 . , ( ) - +
            if (fieldValue !== '') {
                if (fieldValue.match("^([A-Za-z0-9()\x20\x2B,\x2D\x2E])+$")) {
                    return true;
                }
            } else {
                // Allow Empty (will be picked up by the required validator if applied)
                return true;
            }
            return false;
        },

        _specialNameChars: function (/*@dynamic*/fieldValue, fieldAttrib, uiform) {
            /// <param name="fieldAttrib" type="_UiFormFieldAttrib" />
            /// <param name="uiform" type="People.UiForm" />
            // Names can not contain characters : 0-31, 33-38, 40-44, 47, 58-64, 91-94, 123-127
            if ((fieldValue !== '') &&
                (fieldValue.match(/*@static_cast(RegExp)*/"[\x00-\x1F\x21-\x26\x28-\x2C\x2F\x3A-\x40\x5B-\x5E\x7B-\x7F]"))) {
                return false;
            }
            return true;
        },
        _noWwwHttp: function (/*@dynamic*/fieldValue, fieldAttrib, uiform) {
            /// <param name="fieldAttrib" type="_UiFormFieldAttrib" />
            /// <param name="uiform" type="People.UiForm" />
            if (fieldValue) {
                var lowerField = /* @static_cast(String) */fieldValue.toLowerCase();
                if (lowerField.indexOf('www.') !== -1) {
                    return false;
                }
                if (lowerField.indexOf('http') !== -1) {
                    return false;
                }
            }
            return true;
        }

    };

    // The field formatter to use for formatting the fields
    function _validateValue(uiform, fieldName, fieldMap, type, /* @dynamic */value, fieldAttrib) {
        /// <param name="uiform" type="People.UiForm" />
        /// <param name="fieldName" type="String" />
        /// <param name="fieldMap" type="_UiFormFieldMap" />
        /// <param name="type" type="String" />
        /// <param name="fieldAttrib" type="_UiFormFieldAttrib" />
        var validator = /* @static_cast(_UiFormEditValidator) */_editValidators.validators[type];
        Debug.assert(validator);
        var validationResult = validator.validate(value, fieldAttrib, uiform);
        if (validationResult !== true) {
            var errorString = '';
            if (validator.errorString) {
                errorString = validator.errorString(uiform, fieldName, fieldAttrib);
            } else {
                errorString = _getString(uiform, validator.locId, fieldName, validator.locId);
            }
            _formFieldError.setError(uiform, fieldName, fieldMap, errorString);
        }
        // Returns whether there was a validation failure, validation results of true and null (non-blocking) are considered successful
        // i.e. Not a failure, while false is always a failure
        return validationResult;
    };


    var _editValidators = {
        validators: {
            required: {
                validate: P.UiForm.Validators._required,
                locId: 'validationRequired',
            },

            email: {
                validate: P.UiForm.Validators._emailAddress,
                locId: 'validationInvalidEmail',
            },

            mobile: {
                validate: P.UiForm.Validators._mobile,
                locId: 'validationInvalidMobile',
            },

            specialNameChars: {
                validate: P.UiForm.Validators._specialNameChars,
                locId: 'validationInvalidName',
            },

            noWwwHttp: {
                validate: P.UiForm.Validators._noWwwHttp,
                locId: 'validationWwwHttp',
            }
        },
        validate: function (uiform, fieldName, fieldAttrib, fieldValue) {
            /// <returns type="Boolean" />
            /// <param name="uiform" type="People.UiForm" />
            /// <param name="fieldName" type="String" />
            /// <param name="fieldAttrib" type="_UiFormFieldAttrib" />
            /// <param name="fieldValue" type="Object" />

            var hideFieldError = true;
            var blockingFieldError = false;
            var fieldMap = /* @static_cast(_UiFormFieldMap) */uiform._fieldMap[fieldName];
            var validationResult = null;

            if (fieldAttrib.required) {
                validationResult = _validateValue(uiform, fieldName, fieldMap, 'required', fieldValue, fieldAttrib);
                if (validationResult === false) {
                    blockingFieldError = true;
                } else if (validationResult === null) {
                    hideFieldError = false;
                }
		    }
            if (!blockingFieldError) {
                if (fieldAttrib.type === 'email' || fieldAttrib.type === 'mobile') {
                    validationResult = _validateValue(uiform, fieldName, fieldMap, fieldAttrib.type, fieldValue, fieldAttrib);
                    if (validationResult === false) {
                        blockingFieldError = true;
                    } else if (validationResult === null) {
                        hideFieldError = false;
                    }
                }
            }
            if (fieldAttrib.validators) {
                for (var idx = 0, len = fieldAttrib.validators.length; idx < len; idx++) {
                    var type = fieldAttrib.validators[idx];
                    validationResult = _validateValue(uiform, fieldName, fieldMap, type, fieldValue, fieldAttrib);
                    if (validationResult === false) {
                        blockingFieldError = true;
                        break;
                    } else if (validationResult === null) {
                        hideFieldError = false;
                    }
                }
            }

            if (!blockingFieldError && hideFieldError) {
                _formFieldError.hide(uiform, fieldName, fieldMap);
            }
            fieldMap.errorState = blockingFieldError;

            return !blockingFieldError;
        }
    };

    UiFormPrototype.setFormError = function (heading, message) {
        if (this._formErrorDiv) {
            this._formErrorHeader.innerText = heading;
            this._formErrorBody.innerText = message;
            _show(this._formErrorDiv);
        }
    };

    UiFormPrototype.clearFormError = function () {
        if (this._formErrorDiv) {
            _hide(this._formErrorDiv);
        }
    };

    UiFormPrototype.createEditForm = perfUiFormAction("createEditForm", _createEditForm);
    function _createEditForm(container, contact, hydrateContext) {

        _applyCssStyle(this, container, "container");

        var that = this;
        this.container = container;
        this._fieldMap = /* @dynamic */{};
        this._groupMap = {};
        this._sourceData = contact;

        var form = document.createElement('form');
        form.id = 'editForm';
        _addCssStyle(this, form, "form");
        form.setAttribute("autocomplete", "off");

        this._formErrorDiv = document.createElement('div');
        this._formErrorDiv.id = 'uif_formErrorDiv';
        _addCssStyle(this, this._formErrorDiv, "formError");
        _hide(this._formErrorDiv);

        this._formErrorHeader = document.createElement('div');
        this._formErrorDiv.id = 'uif_formErrorHeader';
        _addCssStyle(this, this._formErrorHeader, "formErrorHeader");
        this._formErrorDiv.appendChild(/* @static_cast(Node) */this._formErrorHeader);

        this._formErrorBody = document.createElement('div');
        this._formErrorDiv.id = 'uif_formErrorBody';
        _addCssStyle(this, this._formErrorBody, "formErrorBody");
        this._formErrorDiv.appendChild(/* @static_cast(Node) */this._formErrorBody);

        container.appendChild(/* @static_cast(Node) */this._formErrorDiv);

        if (contact) {
            for (var groupName in this.groupList) {
                var group = /* @static_cast(_UiFormGroupDef) */this.groupList[groupName];
                this._groupMap[groupName] = {
                    groupName: groupName,
                    group: group
                };

                var groupData = /* @static_cast(HTMLElement) */document.createElement('div');
                groupData.id = 'groupData' + groupName;
                _addCssStyle(this, groupData, "groupFields");


                var hasInputs = false;
                var allInputsUsed = true;
                var firstValidFieldName = null;
                //// group.fieldCount = {};
                var displayIndex = 0;
                for (var i = 0; i < group.fieldList.length; i++) {

                    var fieldName = group.fieldList[i];
                    var fieldValue = contact[fieldName];
                    var fieldAttr = this.fieldList[fieldName];
                    this._fieldMap[fieldName] = /* @static_cast(_UiFormFieldMap) */
                        {
                        fieldName: fieldName,
                        fieldAttrib: fieldAttr,
                        groupName: groupName,
                        group: group,
                        displayIndex: -1
                    };

                    var fieldMap = /* @static_cast(_UiFormFieldMap) */this._fieldMap[fieldName];
                    // Display check is used to check for market specific situations only
                    if (_canDisplayField(fieldAttr, fieldName, fieldValue)) {
                        fieldMap.displayIndex = displayIndex;
                        displayIndex++;
                        fieldMap.canDisplay = true;
                        if (!firstValidFieldName && !(fieldAttr.canEdit === false) && !(group.canEdit === false)) {
                            firstValidFieldName = fieldName;
                        }
                        //// group.fieldCount[fieldName] = 0;

                        if (_addInputField(this, groupData, fieldName, fieldValue, fieldAttr, group, hydrateContext, true)) {
                            //// group.fieldCount[fieldName]++;
                            hasInputs = true;
                        } else {
                            allInputsUsed = false;
                        }
                    } else {
                        fieldMap.canDisplay = false;
                    }
                }

                // Assemble the group div
                var groupDiv = /* @static_cast(HTMLElement) */document.createElement('div');
                groupDiv.id = 'groupDiv_' + groupName;
                _addCssStyle(this, groupDiv, "groupContainer");
                _createGroupTitle(this, groupDiv, _getString(this, 'groupTitle', groupName, group.locId));
                groupDiv.appendChild(/* @static_cast(Node) */groupData);

                // Add the link to add a new item to the group if this is a multiple
                if (group.multiple) {
                    if (!hasInputs && !(group.showFirstFieldOnGroupEmpty === false)) {
                        Debug.assert(firstValidFieldName !== null);

                        _showField(this, firstValidFieldName, group);
                    }

                    groupDiv.appendChild(/* @static_cast(Node) */_createAddButton(this, group, groupName));
                }

                // Append the group div to the form
                form.appendChild(/* @static_cast(Node) */groupDiv);
            }
        }

        // Attach the form to the DOM
        container.appendChild(/* @static_cast(Node) */form);
    };

    function _showField(uiform, fieldName, group) {
        /// <param name="uiform" type="People.UiForm" />
        /// <param name="fieldName" type="String" />
        /// <param name="group" type="_UiFormGroupDef" />
        var field = /* @static_cast(_UiFormFieldMap) */uiform._fieldMap[fieldName];
        if (Boolean(field) && !field.visible) {
            _show(field.container);
            field.visible = true;
        }

    }

    function _hideField(uiform, fieldName, group) {
        /// <param name="uiform" type="People.UiForm" />
        /// <param name="fieldName" type="String" />
        /// <param name="group" type="_UiFormGroupDef" />
        var field = /* @static_cast(_UiFormFieldMap) */uiform._fieldMap[fieldName];
        if (Boolean(field) && field.visible) {
            _hide(field.container);
            field.visible = false;

            var groupName = field.groupName;
            //// group.fieldCount[fieldName]--;
            var el = document.getElementById('addExtraDiv_' + groupName);
            _show(/* @static_cast(HTMLElement) */el);
            _updateAddFieldDisplay(uiform, group, groupName);
        }
    }

    UiFormPrototype.setInputFocus = function (fieldName) {
        /// <param name="fieldName" type="String" />
        var field = /* @static_cast(_UiFormFieldMap) */this._fieldMap[fieldName];
        if (!field) {
            return;
        }
        if (Boolean(field.container) && Boolean(field.inputControl)) {
            var inputControl = field.inputControl;
            if (inputControl) {
                inputControl.setFocus();
            }
        }
    };

    function _createAddMenuItem(uiform, label, fieldName, group) {
        /// <param name="uiform" type="People.UiForm" />
        /// <param name="label" type="String" />
        /// <param name="fieldName" type="String" />
        /// <param name="group" type="_UiFormGroupDef" />
        // Uses closure pattern to re-use the parameters in the click event of the NavItem
        var fieldMenuItem = P.UiFlyoutMenuItem.create(/* @static_cast(People.UiFlyoutMenuItem.DefaultOptions) */
            {
            html: _encodeHtml(label),
            click: function (e) {
                var fieldMap = /* @static_cast(_UiFormFieldMap) */uiform._fieldMap[fieldName];
                var groupName = fieldMap.groupName;
                if (!uiform._groupMap[groupName].group.addFieldInPlace) {
                    _repositionField(uiform, group, fieldName, 1000);
                } else if (fieldMap.moved) {
                    _repositionField(uiform, group, fieldName, -1);
                }
                _showField(uiform, fieldName, group);
                _updateAddFieldDisplay(uiform, group, groupName);
                uiform._onFormChanged();
                uiform.setInputFocus(fieldName);

                return false;
            }
        });
        /// <disable>JS3053.IncorrectNumberOfArguments</disable>
        fieldMenuItem.setAriaLabel(_getString(uiform, 'addMenuItemAria', fieldName, null, label));

        return fieldMenuItem;
    };

    function _updateAddMenu(uiform, groupMap) {
        /// <param name="uiform" type="People.UiForm" />
        /// <param name="groupMap" type="_UiFormGroupMap" />
        /// <returns type="Number">The current number of entries</returns>
        var addMenu = groupMap.addMenu;
        if (!addMenu) {
            return;
        }
        addMenu.clear();
        var group = groupMap.group;
        var entries = _createMenuEntries(uiform, group, '');

        if (entries !== null) {
            for (var key in entries) {
                var fieldMap = /* @static_cast(_UiFormFieldMap) */uiform._fieldMap[key];
                if (!fieldMap.visible && fieldMap.canDisplay) {
                    var fieldMenuItem = _createAddMenuItem(uiform, entries[key].label, key, group);

                    addMenu.add(fieldMenuItem);
                }
            }
        }
        return addMenu.count();
    }


    function _updateAddFieldDisplay(uiform, group, groupName) {
        var groupMap = /* @static_cast(_UiFormGroupMap) */uiform._groupMap[groupName];
        var addExtraDiv = groupMap.addExtraDiv;
        if (addExtraDiv) {
            if (_updateAddMenu(uiform, groupMap) === 0) {
                _hide(addExtraDiv);
            } else {
                _show(addExtraDiv);
            }
        }
    }

    function _createAddButton(uiform, group, groupName) {
        var label = _getString(uiform, 'groupTitleAdd', groupName, group.locId);

        var addExtraDiv = /* @static_cast(HTMLElement) */document.createElement('div');
        addExtraDiv.id = 'addExtraDiv_' + groupName;
        _addCssStyle(uiform, addExtraDiv, 'groupAddExtra');

        var addExtraLabel = document.createElement('span');
        _addCssStyle(uiform, addExtraLabel, 'groupAddField');

        // Wrap in an additional div to stop the "jumping" of the label
        var wrapperDiv = document.createElement('div');
        _addCssStyle(uiform, wrapperDiv, 'groupAddExtraWrp');

        var addGlyph = document.createElement('div');
        _addCssStyle(uiform, addGlyph, 'groupAddExtraBtn');
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        addGlyph.innerText = "\uE109";
        wrapperDiv.appendChild(/* @static_cast(Node) */addGlyph);
        // Add role=menu to the elements. This is needed so that the on screen keyboard won't be dismissed by opening the menu. See Winlive#520714.
        addGlyph.setAttribute("role", "menu");
        wrapperDiv.setAttribute("role", "menu");

        var text = document.createElement('span');
        text.setAttribute("role", "text");
        text.setAttribute("id", "groupAddExtraLbl_" + groupName);
        _addCssStyle(uiform, text, "groupAddExtraLbl");

        /// <disable>JS3053.IncorrectNumberOfArguments</disable>
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        WinJS.Utilities.setInnerHTML(text, _getString(uiform, 'groupTitleAdd', groupName, group.locId));
        wrapperDiv.appendChild(/* @static_cast(Node) */text);
        addExtraLabel.appendChild(/* @static_cast(Node) */wrapperDiv);


        var addFieldMenu = P.UiFlyoutMenu.create(/* @static_cast(People.UiFlyoutMenu.DefaultOptions) */{container: addExtraLabel });
        addFieldMenu.setAriaMenuTitleByIds("groupAddExtraLbl_" + groupName + " groupAddExtraMenuLbl_" + groupName);
        addExtraDiv.appendChild(/* @static_cast(Node) */addFieldMenu.$obj);
        addExtraDiv.setAttribute("role", "menubar");
        // and because :active only applies to the immediate clicked element, we have this next line
        P.Animation.addPressStyling(addFieldMenu._$a);

        var ariaText = document.createElement('span');
        ariaText.setAttribute("class", "uiform-hide");
        ariaText.setAttribute("id", "groupAddExtraMenuLbl_" + groupName);
        ariaText.setAttribute("aria-label", _getString(uiform, 'groupTitleAriaAdd', groupName, null, addExtraLabel));
        wrapperDiv.appendChild(/* @static_cast(Node) */ariaText);

        var groupMap = uiform._groupMap[groupName];
        groupMap.addMenu = addFieldMenu;
        groupMap.addExtraDiv = addExtraDiv;
        if (_updateAddMenu(uiform, groupMap) === 0) {
            _hide(addExtraDiv);
        }
        return addExtraDiv;
    };

    function _swapFieldInput(uiform, fieldDiv, fieldName, swapDiv, swapFieldName) {
        /// <param name="uiform" type="People.UiForm" />
        /// <param name="fieldDiv" type="HTMLElement" />
        /// <param name="fieldName" type="String" />
        /// <param name="swapDiv" type="HTMLElement" />
        /// <param name="swapFieldName" type="String" />
        var field = /* @static_cast(_UiFormFieldMap) */uiform._fieldMap[fieldName];
        var swapField = /* @static_cast(_UiFormFieldMap) */uiform._fieldMap[swapFieldName];
        var fieldAttr = field.fieldAttrib;

        // Single Field
        var fieldInput = field.inputControl;
        var swapFieldInput = swapField.inputControl;

        
        Debug.assert(fieldInput && swapFieldInput, "Unable to location fields to swap [" + fieldName + ", " + swapFieldName + "]");
        

        var hold = swapFieldInput.getValue();
        swapFieldInput.setValue(fieldInput.getValue());
        fieldInput.setValue(hold);

        // Call helpers for future compound types???
        var inputValue = _getInputFieldValue(field, fieldName);

        if (!_editValidators.validate(uiform, fieldName, field.fieldAttrib, inputValue)) {
            field.errorState = true;
        }
        // Call helpers for future compound types???
        inputValue = _getInputFieldValue(swapField, swapFieldName);
        if (!_editValidators.validate(uiform, swapFieldName, swapField.fieldAttrib, inputValue)) {
            field.errorState = true;
        }
    }


    function _createFieldTitleDiv(uiform, fieldMap, fieldAttr, group, fieldTitleString) {
        var fieldTitle = /* @static_cast(HTMLElement) */document.createElement('div');
        var fieldName = fieldMap.fieldName;
        fieldTitle.id = 'editFieldTitleDiv_' + fieldName;
        _addCssStyle(uiform, fieldTitle, "fieldTitle");

        var canChangeType = _canChangeFieldType(group, fieldAttr, fieldName);

        var fieldLabelSpan = document.createElement('span');
        fieldLabelSpan.id = 'editLabel_' + fieldName;
        fieldLabelSpan.setAttribute("aria-label", fieldTitleString);

        var fieldLabel = document.createElement('label');
        fieldLabel.setAttribute('for', '#editInput_' + fieldName);
        fieldLabel.innerText = fieldTitleString;
        fieldLabelSpan.appendChild(/* @static_cast(Node) */fieldLabel);
        fieldTitle.appendChild(/* @static_cast(Node) */fieldLabelSpan);

        if (group.multiple && canChangeType) {
            Jx.addClass(fieldLabel, "uiform-hide");
            //_hide(fieldLabel);
            fieldTitle.appendChild(/* @static_cast(Node) */_createFieldTitleSelector(uiform, fieldTitleString, fieldName, group));

            var changeFieldLabelSpan = document.createElement('span');
            changeFieldLabelSpan.setAttribute("class", "uiform-hide");
            changeFieldLabelSpan.id = 'ariaChangeEditLabel_' + fieldName;
            changeFieldLabelSpan.setAttribute("aria-label", _getString(uiform, 'changeFieldAriaMenuTitle', fieldName, null));
            fieldLabelSpan.appendChild(/* @static_cast(Node) */changeFieldLabelSpan);
           
        } else if (fieldAttr.hideLabel) {
            _hide(fieldLabel);
        }

        return fieldTitle;
    };

    ////var _createInputDiv = perfUiFormAction("_createInputDiv", _createInputDivX);
    function _createInputDiv(uiform, fieldMap, value, group) {
        /// <param name="uiform" type="People.UiForm" />
        /// <param name="fieldMap" type="_UiFormFieldMap" />
        /// <param name="value" type="Object" />
        /// <param name="group" type="_UiFormGroupDef" />
        /// <returns type="Node" />

        var fieldAttr = fieldMap.fieldAttrib;
        var fieldName = fieldMap.fieldName;
        var div = /* @static_cast(HTMLElement) */document.createElement('div');
        div.id = 'editFieldDiv_' + fieldName;
        _addCssStyle(uiform, div, "fldCntr");

        var fieldTitleString = _getString(uiform, 'fieldTitle', fieldName, fieldAttr.locId);
        var fieldTitleDiv = _createFieldTitleDiv(uiform, fieldMap, fieldAttr, group, fieldTitleString);
        div.appendChild(/* @static_cast(Node) */fieldTitleDiv);
        fieldMap.titleDiv = fieldTitleDiv;
        fieldMap.container = div;

        var inputControl = /* @static_cast(_UiFormInputControl) */null;
        var canEdit = !(fieldAttr.canEdit === false) && !(group.canEdit === false);
        if (canEdit) {
            ////if (fieldAttr.type === 'date') {
            ////    inputControl = /* @static_cast(_UiFormInputControl) */new P.UiFormDateInputControl(uiform, div, fieldName, fieldAttr, value, /* @static_cast(_UiFormInputValidator) */_editValidators.validate);
            ////} else 
            if (fieldAttr.type === 'select') {
                inputControl = /* @static_cast(_UiFormInputControl) */new P.UiFormSelectInputControl(uiform, div, fieldName, fieldAttr, value, /* @static_cast(_UiFormInputValidator) */_editValidators.validate);
            } else if (fieldAttr.type === 'location' || fieldAttr.type === 'mapLocation') {
                inputControl = /* @static_cast(_UiFormInputControl) */new P.UiFormAddressInputControl(uiform, div, fieldName, fieldAttr, value, /* @static_cast(_UiFormInputValidator) */_editValidators.validate);
            } else {
                inputControl = /* @static_cast(_UiFormInputControl) */new P.UiFormTextInputControl(uiform, div, fieldName, fieldAttr, value, /* @static_cast(_UiFormInputValidator) */_editValidators.validate);
            }
            fieldMap.inputControl = inputControl;

            inputControl.validate();
        } else {
            // Display Read-Only field
            var formatter = P.UiFormRenderers.getRenderer(fieldAttr.type);
            if (formatter) {
                var fieldValueDiv = /* @static_cast(HTMLElement) */document.createElement('div');
                fieldValueDiv.id = 'fieldValueDiv_' + fieldName;
                if (formatter.field(uiform, fieldValueDiv, value, fieldTitleString)) {
                    _addCssStyle(uiform, fieldValueDiv, "displayValue");
                }
                div.appendChild(/* @static_cast(Node) */fieldValueDiv);
            }
        }

        return div;
    };

    function _createMenuEntries(uiform, group, currentFieldName) {
        var fieldList = group.fieldList;

        var entries = {};
        for (var i = 0; i < fieldList.length; i++) {
            var fieldName = fieldList[i];
            var fieldAttr = uiform._formData.fieldList[fieldName];
            if (fieldName !== currentFieldName) {
                if (_canDisplayField(fieldAttr, fieldName, null)) {
                    var canEdit = !(fieldAttr.canEdit === false) && !(group.canEdit === false);
                    if (canEdit) {
                        entries[fieldName] = {
                            fieldAttr: fieldAttr,
                            label: _getString(uiform, 'fieldTitle', fieldName, fieldAttr.locId)
                        };
                    }
                }
            }
        }

        return entries;
    };

    function _createFieldTitleSelector(uiform, label, selectedFieldName, group) {

        var titleSelectorDiv = /* @static_cast(HTMLElement) */document.createElement('div');
        _addCssStyle(uiform, titleSelectorDiv, 'changeField');
        var titleMenu = P.UiFlyoutMenu.create(/* @static_cast(People.UiFlyoutMenu.DefaultOptions) */{html: _encodeHtml(label) });
        titleMenu.setAriaMenuTitleByIds("editLabel_" + selectedFieldName + " ariaChangeEditLabel_" + selectedFieldName);

        titleMenu.addBeforeShowHandler(function (/* @type(People.UiFlyoutMenu) */menu) {
            menu.clear();
            var entries = _createMenuEntries(uiform, group, selectedFieldName);

            // Add Menu Entries
            if (entries !== null) {
                for (var key in entries) {
                    var fieldAttr = entries[key].fieldAttr;
                    if (_canChangeFieldType(group, fieldAttr, key)) {
                        //// var fieldId = " id='changeType_" + key + "'";
                        var fieldMenuItem = _createChangeType(uiform, entries[key].label, selectedFieldName, key, group);

                        menu.add(fieldMenuItem);
                    }
                }
            }
        });

        titleSelectorDiv.appendChild(/* @static_cast(Node) */titleMenu.$obj);
        titleSelectorDiv.setAttribute("role", "menubar");

        return titleSelectorDiv;
    };

    function _canChangeFieldType(group, fieldAttr, fieldName) {
        /// <param name="group" type="_UiFormGroupDef" />
        /// <param name="fieldAttr" type="_UiFormFieldAttrib" />
        /// <param name="fieldName" type="String" />
        if (!group.multiple || _mustEditField(fieldAttr, fieldName) || group.disallowFieldTypeChange || fieldAttr.disallowFieldTypeChange || fieldAttr.hideLabel) {
            return false;
        }
        return true;
    };

    function _swapFields(uiform, group, existingField, swapFieldName) {
        /// <param name="uiform" type="People.UiForm" />
        /// <param name="group" type="_UiFormGroupDef" />
        /// <param name="existingField" type="String" />
        /// <param name="swapFieldName" type="String" />
        var existFieldMap = /* @static_cast(_UiFormFieldMap) */uiform._fieldMap[existingField];
        var swapFieldMap = /* @static_cast(_UiFormFieldMap) */uiform._fieldMap[swapFieldName];
        var existDiv = existFieldMap.container;
        var swapDiv = swapFieldMap.container;
        if (!existDiv || !swapDiv) {
            return false;
        }
        if (existDiv === swapDiv) {
            
            Debug.assert(existDiv !== swapDiv, "Attempt to swap the same field with itself! [" + existingField + "] [" + swapFieldName + "]");
            
            return false;
        }

        // Clear out any error(s)
        _formFieldError.clear(uiform, existingField, existFieldMap);
        _formFieldError.clear(uiform, swapFieldName, swapFieldMap);

        var existParent = /* @static_cast(HTMLElement) */existDiv.parentNode;
        var existNext = /* @static_cast(HTMLElement) */existDiv.nextSibling;
        var swapParent = /* @static_cast(HTMLElement) */swapDiv.parentNode;
        var swapNext = /* @static_cast(HTMLElement) */swapDiv.nextSibling;

        if (Boolean(existNext) && existNext.id === swapDiv.id) {
            // Swapping 2 adjacent fields (swap is below existing)
            swapParent.removeChild(/* @static_cast(Node) */swapDiv);
            existParent.insertBefore(/* @static_cast(Node) */swapDiv, /* @static_cast(Node) */existDiv);
        } else if (Boolean(swapNext) && swapNext.id === existDiv.id) {
            // Swapping 2 adjacent fields (swap is above existing)
            existParent.removeChild(/* @static_cast(Node) */existDiv);
            swapParent.insertBefore(/* @static_cast(Node) */existDiv, /* @static_cast(Node) */swapDiv);
        } else if (Boolean(swapNext)) {
            // Insert swapped item first before removing existing
            swapParent.removeChild(/* @static_cast(Node) */swapDiv);
            existParent.insertBefore(/* @static_cast(Node) */swapDiv, /* @static_cast(Node) */existDiv);
            existParent.removeChild(/* @static_cast(Node) */existDiv);
            swapParent.insertBefore(/* @static_cast(Node) */existDiv, /* @static_cast(Node) */swapNext);
        } else if (Boolean(existNext)) {
            // Insert existing item first before removing swapped
            existParent.removeChild(/* @static_cast(Node) */existDiv);
            swapParent.insertBefore(/* @static_cast(Node) */existDiv, /* @static_cast(Node) */swapDiv);
            swapParent.removeChild(/* @static_cast(Node) */swapDiv);
            existParent.insertBefore(/* @static_cast(Node) */swapDiv, /* @static_cast(Node) */existNext);
        } else {
            // Swapping 2 not co-located (== id's) or at top/bottom items (no swapNext or existNext)
            existParent.removeChild(/* @static_cast(Node) */existDiv);
            // Insert the existDiv after the swapDiv
            if (swapNext) {
                swapParent.insertBefore(/* @static_cast(Node) */existDiv, /* @static_cast(Node) */swapNext);
            } else {
                swapParent.appendChild(/* @static_cast(Node) */existDiv);
            }

            swapParent.removeChild(/* @static_cast(Node) */swapDiv);
            // Insert the swapDiv before the previous existDiv's next sibling (or end if it was at the end)
            if (existNext) {
                existParent.insertBefore(/* @static_cast(Node) */swapDiv, /* @static_cast(Node) */existNext);
            } else {
                existParent.appendChild(/* @static_cast(Node) */swapDiv);
            }
        }
        _swapFieldInput(uiform, existDiv, existingField, swapDiv, swapFieldName);
        // Mark both as moved
        swapFieldMap.moved = true;
        existFieldMap.moved = true;

        // Reset visibility (if swapped with a hidden field)
        if (existFieldMap.visible !== swapFieldMap.visible) {
            if (swapFieldMap.visible) {
                _hideField(uiform, swapFieldName, group);
            } else {
                _showField(uiform, swapFieldName, group);
            }
            if (existFieldMap.visible) {
                _hideField(uiform, existingField, group);
            } else {
                _showField(uiform, existingField, group);
            }
            var groupName = existFieldMap.groupName;
            _updateAddFieldDisplay(uiform, group, groupName);
        }

        return true;
    };

    function _repositionField(uiform, group, fieldName, newPosition) {
        /// <param name="uiform" type="People.UiForm" />
        var fieldMap = /* @static_cast(_UiFormFieldMap) */uiform._fieldMap[fieldName];
        var fieldDiv = fieldMap.container;
        if (!fieldDiv) {
            return false;
        }
        var fieldParent = fieldDiv.parentNode;
        var fieldPrev = fieldDiv.previousSibling;
        var calcPosition = -1;
        if (newPosition === undefined || newPosition < 0) {
            calcPosition = fieldMap.displayIndex;
            if (calcPosition === -1) {
                return false;
            }
        } else {
            calcPosition = newPosition;
        }
        fieldParent.removeChild(/* @static_cast(Node) */fieldDiv);
        var children = fieldParent.childNodes;
        if (children.length <= calcPosition) {
            fieldParent.appendChild(/* @static_cast(Node) */fieldDiv);
        } else {
            fieldParent.insertBefore(/* @static_cast(Node) */fieldDiv, children[calcPosition]);
        }

        uiform._fieldMap[fieldName].moved = false;

        return true;
    };


    function _createChangeType(uiform, label, existingFieldName, fieldName, group) {
        /// <param name="uiform" type="People.UiForm" />
        // Uses closure pattern to re-use the parameters in the click event of the NavItem
        var field = uiform._fieldMap[fieldName];
        var inputValue = _getInputFieldValue(field, fieldName);
        /// <disable>JS3053.IncorrectNumberOfArguments</disable>
        var changeLabel = _getString(uiform, 'fldChngLbl', fieldName, null, label, inputValue);

        var fieldNavLink = P.UiFlyoutMenuItem.create(/* @static_cast(People.UiFlyoutMenuItem.DefaultOptions) */{html: _encodeHtml(changeLabel),
            click: function (e) {
                try {
                    if (_swapFields(uiform, group, existingFieldName, fieldName)) {
                        uiform.setInputFocus(fieldName);
                    }
                } catch (err) {
                    
                    Debug.assert(false, "Error swapping fields:" + err);
                    
                }

                return false;
            }
        });
        /// <disable>JS3053.IncorrectNumberOfArguments</disable>
        fieldNavLink.setAriaLabel(_getString(uiform, 'changeFieldTypeAria', fieldName, null, label));

        return fieldNavLink;
    };


    ////var _addInputField = perfUiFormAction("_addInputField", _addInputFieldX);
    function _addInputField(uiform, container, fieldName, fieldValue, fieldAttr, group, /* @dynamic */hydratedContext, hideFields) {
        /// <param name="uiform" type="People.UiForm" />

        var forcedEdit = false;
        if (hydratedContext) {
            if (hydratedContext.fields && hydratedContext.fields[fieldName] !== undefined) {
                fieldValue = hydratedContext.fields[fieldName];
            }
            if (hydratedContext.displayedFields && hydratedContext.displayedFields[fieldName] !== undefined) {
                // Special case of the field being added to the form but no entered data
                forcedEdit = true;
            }
        }
        var displayField = false;
        if (!group.multiple || forcedEdit || _mustEditField(fieldAttr, fieldName)) {
            displayField = true;
        }
        var fieldMap = uiform._fieldMap[fieldName];
        fieldMap.container = container;

        container.appendChild(_createInputDiv(uiform, fieldMap, fieldValue, group));

        var inputControl = fieldMap.inputControl;
        if (Boolean(inputControl) && !inputControl.isEmpty()) {
            displayField = true;
        }

        fieldMap.visible = displayField;
        if (!displayField && hideFields) {
            _hide(fieldMap.container);
        }

        return displayField;
    };

    function _updateTarget(target, uiform) {
        /// <param name="uiform" type="People.UiForm" />

        var field = /* @static_cast(_UiFormFieldMap) */null;
        var fieldValue = null;
        var inputValue = null;

        for (var fieldName in uiform._fieldMap) {
            field = uiform._fieldMap[fieldName];
            if (Boolean(field.container) && Boolean(field.inputControl)) {
                fieldValue = null;
                if (uiform._fieldMap[fieldName].visible) {
                    inputValue = _getInputFieldValue(field, fieldName);
                    if (Boolean(inputValue) && String(inputValue) !== '') {
                        fieldValue = inputValue;
                    }
                }
                _assignFieldValue(target, fieldName, fieldValue);
            }
        }
    };

    UiFormPrototype.saveEditForm = function (/*@dynamic*/contact) {

        // Clear the form error before doing any field validation
        this.clearFormError();

        // Force Revalidation
        var failedControl = _revalidate(this);
        if (failedControl) {
            failedControl.setFocus();
            return false;
        }

        // Set the focus to the field with errors.
        for (var errFieldName in this._fieldMap) {
            // Reset the processed flag (used below)
            if (this._fieldMap[errFieldName].errorState) {
                this.setInputFocus(errFieldName);
                return false;
            }
        }

        // Check to see if there's form-level validation
        if (this._formData.formValidator) {
            // copy the fields to a temporary object (so we dont override thereal one)
            // May be able to remove with "real" system, this is really just a workaround
            // for the shared mocks (testing)
            var valObject = {};
            _updateTarget(valObject, this);

            if (!this._formData.formValidator(this, valObject, this._loc)) {
                this._onFormChanged();
                return false;
            }
        }

        _updateTarget(contact, this);

        return true;
    };

    function _revalidate(uiform) {
        /// <param name="uiform" type="People.UiForm" />
        ///<returns type="_UiFormInputControl" />
        // Scan thru the edit fields and populate with the 'hydrated' data if present
        for (var fieldName in uiform._fieldMap) {
            var field = /* @static_cast(_UiFormFieldMap) */uiform._fieldMap[fieldName];
            if (Boolean(field.container) && Boolean(field.inputControl)) {
                var inputValue = _getInputFieldValue(field, fieldName);
                if (!_editValidators.validate(uiform, fieldName, field.fieldAttrib, inputValue)) {
                    field.errorState = true;
                    return field.inputControl;
                }
            }
        }

        return null;
    };

    function _getInputFieldValue(/* @type(_UiFormFieldMap) */field, fieldName) {
        // <returns type="Object">Returns the value of the field the type depends of the fields being requested</returns>
        if (!field) {
            return /* @static_cast(Object) */'';
        }
        if (Boolean(field.container) && Boolean(field.inputControl)) {
            var inputField = field.inputControl;
            if (inputField) {
                return /* @static_cast(Object) */inputField.getValue();
            }
        }

        return /* @static_cast(Object) */'';
    };

    function _getFieldMaxLength(target, fieldName, fieldAttr) {
        /// <summary>
        /// This is a helper method to fetch the maximum length to apply to a field based on the
        /// fieldAttr configuration, the maxLength can be a function callback, fixed value or not defined.
        /// The usage of a function would be in cases where the length is based on some other value of
        /// the target object.
        /// </summary>
        /// <param name="target" type="Object" />
        /// <param name="fieldName" type="String" />
        /// <param name="fieldAttr" type="_UiFormFieldAttrib" />
        if (fieldAttr.maxLength) {
            if (typeof fieldAttr.maxLength === 'function') {
                return fieldAttr.maxLength(target, fieldName, fieldAttr);
            }
            return fieldAttr.maxLength;
        }

        return null;
    };

    UiFormPrototype.getFieldMaxLength = function (fieldName, fieldAttr) {
        /// <summary>
        /// This is a helper method to fetch the maximum length to apply to a field based on the
        /// fieldAttr configuration, the maxLength can be a function callback, fixed value or not defined.
        /// The usage of a function would be in cases where the length is based on some other value of
        /// the target object.
        /// </summary>
        /// <param name="fieldName" type="String" />

        return _getFieldMaxLength(this._sourceData, fieldName, fieldAttr);
    };


    UiFormPrototype.getInputFieldValueByName = function (fieldName) {
        /// <summary>
        /// Retrieves data from an input field by name. Used as part of a workaround so that
        /// field input can be accessed from the controls. Messy, but necessary for now.
        /// </summary>
        /// <param name="fieldName" type="String" optional="false">
        /// This is the name of the field to extract the value from.
        /// </param>
        var field = /* @static_cast(_UiFormFieldMap) */this._fieldMap[fieldName];
        return _getInputFieldValue(field, fieldName);
    };

    UiFormPrototype.dehydrateEditForm = function (/*@dynamic*/contact) {
        /// <summary>
        /// Dehydrates the "edit Form" form and returns an object that can be used to rehydrate
        /// the edit form back to the current state.
        /// </summary>
        /// <param name="contact" optional="false">
        /// This is the original contact that will be checked of any fields have changed
        /// </param>

        var dehydrated = {};
        if (Boolean(document.activeElement) && Boolean(document.activeElement.id)) {
            // Save the current focus element (if available), assumes running on IE or
            // a browser that supports this method. Saves the id, name and type as this
            // may return a field that is not a member of our form.
            var activeElement = /* @static_cast(HTMLElement) */document.activeElement;
            dehydrated.focus = {};
            dehydrated.focus.id = activeElement.id;
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            dehydrated.focus.name = activeElement.name;
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            dehydrated.focus.type = activeElement.type;
        }

        dehydrated.fields = {};
        dehydrated.displayedFields = {};
        var dehydratedFields = dehydrated.fields;
        var displayedFields = dehydrated.displayedFields;

        for (var fieldName in this._fieldMap) {
            var field = /* @static_cast(_UiFormFieldMap) */this._fieldMap[fieldName];
            if (Boolean(field.container) && Boolean(field.inputControl)) {
                var fieldValue = null;
                if (this._fieldMap[fieldName].visible) {
                    fieldValue = field.inputControl.getValue();
                    displayedFields[fieldName] = true;
                }
                // Record the value of all changed fields (visible or not)
                if (!field.inputControl.compareValues(fieldValue, contact[fieldName])) {
                    dehydratedFields[fieldName] = fieldValue;
                }
            }
        }

        return dehydrated;
    };

    UiFormPrototype.isEditFormDirty = function (contact) {
        /// <summary>
        /// Returns whether the edit form has changed fields (isDirty), rather than keeping "edit" state this implmenetation
        /// simple checks against the current object for changes.
        /// </summary>
        /// <param name="contact" type="Object" optional="false">
        /// This is the original contact that will be checked of any fields have changed
        /// </param>

        // Scan thru the edit fields and populate with the 'hydrated' data if present
        for (var fieldName in this._fieldMap) {
            var field = /* @static_cast(_UiFormFieldMap) */this._fieldMap[fieldName];
            if (Boolean(field.container) && Boolean(field.inputControl)) {
                if (!field.inputControl.compare(contact[fieldName])) {
                    return true;
                }
            }
        }

        return false;
    };

});
