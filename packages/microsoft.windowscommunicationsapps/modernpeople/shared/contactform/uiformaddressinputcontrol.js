
// Copyright (C) Microsoft Corporation.  All rights reserved.

///<reference path="../../Shared/JSUtil/Namespace.js"/>
///<reference path="../../../Shared/Jx/Core/Jx.js"/>
///<reference path="./uiform.js"/>
/// <dictionary>uiform,Attr,Multiline</dictionary>

Jx.delayDefine(People, "UiFormAddressInputControl", function () {

    var P = window.People;

    var c_addressFields = [ "street", "city", "state", "zipCode", "country" ];

    function _createTemplate(uiform, fieldAttr, fieldMap) {
        /// <param name="uiform" type="People.UiForm">This is the owning uiform for the input control.</param>
        /// <param name="fieldAttr" type="_UiFormFieldAttrib" />
        var helper = new P.AddressHelper();

        var readOnlyString = "";
        var className = uiform.getCssClass("fieldInput");
        var fldCntrClassName = uiform.getCssClass("fldCntr");
        var locationClassName = uiform.getCssClass("fldCntr-location");
        if (fieldAttr.readonly) {
            readOnlyString = " readonly='readonly'";
            className += " " + uiform.getCssStyle("readonly");
        }

        var tmpl = "";
        var fieldOrder = helper.getAddressEditFieldOrderStrings();
        var count = fieldOrder.length;
        for (var lp = 0; lp < count; lp++) {
            var name = fieldOrder[lp];
            var fieldDef = fieldMap[name];
            fieldDef._$index = lp;

            var fieldName = fieldDef["name"];
            var htmlType = fieldDef["htmlType"] || "input";
            if (htmlType === "textarea") {
                tmpl += "<div class='" + fldCntrClassName + " " + locationClassName + "'>" +
                    "<textarea id='editInput_" + fieldName + "' class='" + className + "' spellcheck='false'" + readOnlyString + "></textarea>" +
                    "</div>";
            } else {
                tmpl += "<div class='" + fldCntrClassName + " " + locationClassName + "'>" +
                    "<input id='editInput_" + fieldName + "' class='" + className + "' type='text' autocomplete='off' " + readOnlyString + " />" +
                    "</div>";
            }
        }

        return tmpl;
    };

    function _createFieldMap(fieldName, fieldAttr) {
        var fieldMap = {  };
        var count = c_addressFields.length; 
        for (var lp = 0; lp < count; lp++) {
            var name = c_addressFields[lp];
            var newFieldName = fieldName + "-" + name;
            var fieldDef = { 
                name: newFieldName, 
                maxLength: fieldAttr.maxLength,
                showPlaceholder: true,
                placeholder: newFieldName };
            fieldMap[name] = fieldDef;
            if (name === "street") {
                fieldDef.htmlType = "textarea";
                fieldDef.lines = 2;
            }
        }    

        return fieldMap;
    };

    ////var _createInputControl = perfUiFormAction("UiFormAddressInputControl._createInputControl", _createInputControlX);
    function _createInputControl(control, uiform, container, fieldName, fieldAttr, fieldValue) {
        /// <param name="control" type="People.UiFormAddressInputControl">The control.</param>
        /// <param name="uiform" type="People.UiForm">This is the owning uiform for the input control.</param>
        /// <param name="container" type="HTMLElement" />
        /// <param name="fieldName" type="String" />
        /// <param name="fieldAttr" type="_UiFormFieldAttrib" />
        /// <param name="value" type="Date" />

        
        Debug.assert(Jx.isObject(control));
        Debug.assert(Jx.isObject(uiform));
        Debug.assert(Jx.isObject(container));
        Debug.assert(Jx.isString(fieldName));
        Debug.assert(Jx.isObject(fieldAttr));
        Debug.assert(Jx.isNullOrUndefined(fieldValue) || Jx.isObject(fieldValue));
        

        var fieldMap = _createFieldMap(fieldName, fieldAttr);
        var html = _createTemplate(uiform, fieldAttr, fieldMap);

        // We can't just replace or append to the innerHTML as the container contains other elements
        var fragment = document.createElement('div');
        fragment.innerHTML = html;
        container.appendChild(fragment);
        
        for (var mapName in fieldMap) {
            var fieldDef = fieldMap[mapName];
            var addrFieldName = fieldDef["name"];
            var value = fieldValue ? fieldValue[mapName] : "";

            fieldDef._$inputControl = new P.UiFormTextInputControl(uiform, fragment, addrFieldName, fieldDef, value, 
                function _validator(uiform, fieldName, fieldAttr, value) {
                    try {
                        control.validate();
                    } catch (e) {
                    }
                    return false;
                });
        }
        control._$fieldMap = fieldMap;
    }

    // UiFormAddressInputControl
    P.UiFormAddressInputControl = UiFormAddressInputControl;
    /* @constructor */function UiFormAddressInputControl(uiform, container, fieldName, fieldAttr, value, validator) {
        /// <summary>
        /// An Address Input field.
        /// </summary>
        /// <param name="uiform" type="People.UiForm">This is the owning uiform for the input control.</param>
        /// <param name="container" type="HTMLElement" >This is the container item for the UiFormDateInputControl.</param>
        /// <param name="fieldName" type="String" />
        /// <param name="fieldAttr" type="_UiFormFieldAttrib" />
        /// <param name="value" type="Address Object" />
        /// <param name="validator" type="_UiFormInputValidator" />

        this._$uiform = uiform;
        this._$fieldName = fieldName;
        this._$fieldAttr = fieldAttr;
        this._$validator = validator;

        _createInputControl(this, uiform, container, fieldName, fieldAttr, value);
        
        Debug.assert(Jx.isNullOrUndefined(validator) || typeof validator === "function");
        

    };

    
    UiFormAddressInputControl.__class = true;
    

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var UiFormAddressInputControlPrototype = UiFormAddressInputControl.prototype;
    /* @dynamic */UiFormAddressInputControlPrototype._$fieldMap = null;

    UiFormAddressInputControlPrototype.getValue = function () {

        var fieldMap = this._$fieldMap;
        var result = {};
        for (var name in fieldMap) {
            var fieldDef = fieldMap[name];
            /* @disable(0092) */
            var /* @type(wLive.UiForm.UiFormTextInputControl) */inputControl = fieldDef._$inputControl;
            /* @restore(0092) */

            result[name] = inputControl.getValue();
        }

        return result;
    };

    UiFormAddressInputControlPrototype.setValue = function (/* @dynamic */newValue) {

        var fieldMap = this._$fieldMap;
        for (var name in fieldMap) {
            var fieldDef = fieldMap[name];
            /* @disable(0092) */
            var /* @type(wLive.UiForm.UiFormTextInputControl) */inputControl = fieldDef._$inputControl;
            /* @restore(0092) */
            inputControl.setValue(newValue[name] || "");
        }
    };

    UiFormAddressInputControlPrototype.setFocus = function () {
        /// <Summary>
        /// Called to set the input focus to the first displayed field
        /// </Summary>
        var fieldMap = this._$fieldMap;
        for (var name in fieldMap) {
            var fieldDef = fieldMap[name];
            if (fieldDef["_$index"] === 0) {
                /* @disable(0092) */
                var /* @type(wLive.UiForm.UiFormTextInputControl) */inputControl = fieldDef._$inputControl;
                /* @restore(0092) */
                inputControl.setFocus();
                break;
            }
        }
    };

    UiFormAddressInputControlPrototype.validate = function () {
        if (this._$validator) {
            return this._$validator(this._$uiform, this._$fieldName, this._$fieldAttr, this.getValue());
        }
        return true;
    };

    UiFormAddressInputControlPrototype.compare = function (existingValue) {
        // Should both be Date objects (or null)
        return this.compareValues(this.getValue(), existingValue);
    };

    function _compareValue(curTarget, existTarget, fieldName) {
        var currentValue = (curTarget ? curTarget[fieldName] : null);
        var existingValue = (existTarget ? existTarget[fieldName] : null);

        if (currentValue === null && existingValue === null) {
            return true;
        }
        // Treat null, undefined and '' as the same (for now)
        if (currentValue !== null && currentValue !== "") {
            return (String(currentValue) === String(existingValue));
        }
        // Treat null, undefined and '' as the same (for now)
        if (Jx.isNullOrUndefined(existingValue) || existingValue === "") {
            return true;
        }

        return String(currentValue) === String(existingValue);
    };

    UiFormAddressInputControlPrototype.compareValues = function (currentValue, existingValue) {
        // Should both be Date objects (or null)
        var curNull = Jx.isNullOrUndefined(currentValue);
        var existNull = Jx.isNullOrUndefined(existingValue);

        if (curNull && existNull) {
            return true;
        }
        var count = c_addressFields.length; 
        for (var lp = 0; lp < count; lp++) {
            var fieldName = c_addressFields[lp];
            
            if (!_compareValue(currentValue, existingValue, fieldName)) {
                return false;
            }
        }
        return true;
    };

    UiFormAddressInputControlPrototype.isEmpty = function () {
        var address = this.getValue();

        var count = c_addressFields.length; 
        for (var lp = 0; lp < count; lp++) {
            var fieldName = c_addressFields[lp];
            
            if (Boolean(address[fieldName])) {
                return false;
            }            
        }

        return true;
    };

});
