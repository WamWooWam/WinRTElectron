
// Copyright (C) Microsoft Corporation.  All rights reserved.

///<reference path="../../Shared/JSUtil/Namespace.js"/>
///<reference path="../../../Shared/Jx/Core/Jx.js"/>
///<reference path="./uiform.js"/>
/// <dictionary>uiform,Attr,Multiline</dictionary>

Jx.delayDefine(People, "UiFormTextInputControl", function () {

    var P = window.People;

    // ---------------------------------------------------------------------------------------------------------------

    function _trim(value) {
        /// <param name="value" type="String" />
        if (value) {
            return value.replace(/^\s+|\s+$/g, '');
        }
        return value;
    };

    function _bindInputControl(fieldInput, control, uiform, fieldName, fieldAttr, value) {
        /// <param name="fieldInput" type="HTMLElement">The existing DOM Element.</param>
        /// <param name="control" type="People.UiFormTextInputControl">The control.</param>
        /// <param name="uiform" type="People.UiForm">This is the owning uiform for the input control.</param>
        /// <param name="fieldName" type="String" />
        /// <param name="fieldAttr" type="_UiFormFieldAttrib" />
        /// <param name="value" type="String" />

        var fieldValue = (value ? value : "");
        var maxLength = uiform.getFieldMaxLength(fieldName, fieldAttr);
        if (maxLength) {
            fieldInput.maxLength = maxLength;
        }
        fieldInput.setAttribute("aria-label", uiform.getString("fieldTitle", fieldName, null));

        fieldInput.value = fieldValue;
        fieldInput.addEventListener("blur", function () {
            var output = false;
            try {
                control.validate();
            } catch (e) {
            }
            return output;
        });
        // Due to a bug with the placeholder text we need to set the placeholder AFTER the value
        // otherwise the placeholder does not show.
        if (fieldAttr.showPlaceholder) {
            var fieldTitleString = uiform.getString("fieldPlaceholder", fieldName, fieldAttr.locId);
            fieldInput.setAttribute("placeholder", fieldTitleString);
        }

        uiform.setCssStyle(fieldInput, "fieldInput");
        if (fieldAttr.readonly) {
            fieldInput.readonly = "readonly";
            uiform.setCssStyle(fieldInput, "readonly");
        }
        control._$input = fieldInput;
        control._$div = fieldInput;
    };

    function _createInputControl(control, uiform, fieldName, fieldAttr, value) {
        /// <param name="control" type="People.UiFormTextInputControl">The control.</param>
        /// <param name="uiform" type="People.UiForm">This is the owning uiform for the input control.</param>
        /// <param name="fieldName" type="String" />
        /// <param name="fieldAttr" type="_UiFormFieldAttrib" />
        /// <param name="value" type="String" />

        var fieldValue = (value ? value : "");
        var lines = fieldAttr.lines || 1;
        var fieldInput = null;
        if (lines > 1) {
            // Multiline field required
            fieldInput = document.createElement("textarea");
            fieldInput.setAttribute("autocomplete", "off");
            fieldInput.setAttribute("spellcheck", "false");
            fieldInput.rows = lines;
        } else {
            var fieldType = fieldAttr.htmlType || fieldAttr.type || "text";
            fieldInput = document.createElement("input");
            fieldInput.setAttribute("autocomplete", "off");
            fieldInput.setAttribute("spellcheck", "false");
            try {
                fieldInput.type = fieldType;
            } catch (e) {
                // work around a test platform issue where the PAC controls are not supported
                fieldInput.type = 'text';
            }
        }
        fieldInput.name = fieldName;
        fieldInput.id = "editInput_" + fieldName;

        var maxLength = uiform.getFieldMaxLength(fieldName, fieldAttr);
        if (maxLength) {
            fieldInput.maxLength = maxLength;
        }
        fieldInput.setAttribute('aria-labelledby', 'editLabel_' + fieldName);

        fieldInput.value = fieldValue;
        fieldInput.addEventListener("blur", function () {
            var output = false;
            try {
                control.validate();
            } catch (e) {
            }
            return output;
        });
        // Due to a bug with the placeholder text we need to set the placeholder AFTER the value
        // otherwise the placeholder does not show.
        if (fieldAttr.showPlaceholder) {
            var fieldTitleString = uiform.getString("fieldPlaceholder", fieldName, fieldAttr.locId);
            fieldInput.setAttribute("placeholder", fieldTitleString);
        }

        uiform.setCssStyle(fieldInput, "fieldInput");
        if (fieldAttr.readonly) {
            fieldInput.readonly = "readonly";
            uiform.setCssStyle(fieldInput, "readonly");
        }
        control._$input = fieldInput;
        control._$div = fieldInput;
    }

    // UiFormTextInputControl
    P.UiFormTextInputControl = UiFormTextInputControl;
    /* @constructor */function UiFormTextInputControl(uiform, container, fieldName, fieldAttr, value, validator) {
        /// <summary>
        /// A Simple Input field.
        /// </summary>
        /// <param name="uiform" type="People.UiForm">This is the owning uiform for the input control.</param>
        /// <param name="container" type="HTMLElement" >This is the container item for the UiFormTextInputControl.</param>
        /// <param name="fieldName" type="String" />
        /// <param name="fieldAttr" type="_UiFormFieldAttrib" />
        /// <param name="value" type="Object" />
        /// <param name="validator" type="_UiFormInputValidator" />

        this._$uiform = uiform;
        this._$fieldName = fieldName;
        this._$fieldAttr = fieldAttr;
        this._$validator = validator;

        var existing = container.querySelector("#editInput_" + fieldName);
        if (!existing) {
        	_createInputControl(this, uiform, fieldName, fieldAttr, value);

        	// Add to the display container
        	container.appendChild(this._$div);
        } else {
            // Bind to an existing element in the container
            _bindInputControl(existing, this, uiform, fieldName, fieldAttr, value);
        }
    };

    
    UiFormTextInputControl.__class = true;
    

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var UiFormTextInputControlPrototype = UiFormTextInputControl.prototype;
    /* @type(HTMLInputElement) */UiFormTextInputControlPrototype._$input = null;

    UiFormTextInputControlPrototype.getValue = function () {
        return _trim(this._$input.value);
    };

    UiFormTextInputControlPrototype.setValue = function (newValue) {
        var fieldInput = this._$input;
        fieldInput.value = newValue;

        if (fieldInput.placeholder) {
            // Due to a bug with the placeholder text we need to RESET the placeholder AFTER the value
            // otherwise the placeholder does not show.
            fieldInput.placeholder = fieldInput.placeholder;
        }
    };

    UiFormTextInputControlPrototype.setFocus = function () {
        this._$input.focus();
    };

    UiFormTextInputControlPrototype.validate = function () {
        if (this._$validator) {
            return this._$validator(this._$uiform, this._$fieldName, this._$fieldAttr, this.getValue());
        }
        return true;
    };

    UiFormTextInputControlPrototype.compare = function (existingValue) {
        return this.compareValues(this.getValue(), existingValue);
    };

    UiFormTextInputControlPrototype.compareValues = function (currentValue, existingValue) {
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

    UiFormTextInputControlPrototype.isEmpty = function () {
        var value = this.getValue();
        return value === null || value === undefined || value === "";    
    };

});
