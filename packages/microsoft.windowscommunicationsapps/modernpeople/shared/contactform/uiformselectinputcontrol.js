
// Copyright (C) Microsoft Corporation.  All rights reserved.

///<reference path="../../Shared/JSUtil/Namespace.js"/>
///<reference path="../../../Shared/Jx/Core/Jx.js"/>
///<reference path="./uiform.js"/>
/// <dictionary>uiform,Attr</dictionary>

Jx.delayDefine(People, "UiFormSelectInputControl", function () {

    var P = window.People;

    // ---------------------------------------------------------------------------------------------------------------

    function _createInputControl(control, uiform, fieldName, fieldAttr, value) {
        /// <param name="control" type="People.UiFormSelectInputControl">The control.</param>
        /// <param name="uiform" type="People.UiForm">This is the owning uiform for the input control.</param>
        /// <param name="fieldName" type="String" />
        /// <param name="fieldAttr" type="_UiFormFieldAttrib" />
        /// <param name="value" type="Object" />

        var fieldValue = (value ? value : 0);
        var options = fieldAttr.options;
        
        Debug.assert(Jx.isArray(options), "Need to specify options for select control!");
        

        var fieldInput = document.createElement('select');

        fieldInput.name = fieldName;
        fieldInput.id = "editInput_" + fieldName;
        fieldInput.setAttribute('aria-labelledby', 'editLabel_' + fieldName);
        for (var i = 0, len = options.length; i < len; i++) {
            var selectOption = options[i];
            
            Debug.assert(selectOption);
            Debug.assert(selectOption.value);
            Debug.assert(selectOption.displayName);
            
            var option = document.createElement('option');
            option.value = selectOption.value;
            option.innerText = selectOption.displayName;
            fieldInput.appendChild(option);
        }
        fieldInput.value = value;

        fieldInput.onblur = function () {
            var output = false;
            try {
                control.validate();
            } catch (e) {
            }
            return output;
        };

        uiform.setCssStyle(fieldInput, "fieldInput");
        if (fieldAttr.readonly) {
            fieldInput.readonly = "readonly";
            uiform.CssStyle(fieldInput, "readonly");
        }
        control._$input = fieldInput;
        control._$div = fieldInput;
    }

    // UiFormSelectInputControl
    P.UiFormSelectInputControl = UiFormSelectInputControl;
    /* @constructor */function UiFormSelectInputControl(uiform, container, fieldName, fieldAttr, value, validator) {
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

        _createInputControl(this, uiform, fieldName, fieldAttr, value);

        // Add to the display container
        container.appendChild(this._$div);
    };

    
    UiFormSelectInputControl.__class = true;
    

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var UiFormSelectInputControlPrototype = UiFormSelectInputControl.prototype;
    /* @type(HTMLInputElement) */UiFormSelectInputControlPrototype._$input = null;

    UiFormSelectInputControlPrototype.getValue = function () {
        return this._$input.value;
    };

    UiFormSelectInputControlPrototype.setValue = function (newValue) {
        this._$input.value = newValue;
    };

    UiFormSelectInputControlPrototype.setFocus = function () {
        this._$input.focus();
    };

    UiFormSelectInputControlPrototype.validate = function () {
        return true;
    };

    UiFormSelectInputControlPrototype.compare = function (existingValue) {
        return this.compareValues(this.getValue(), existingValue);
    };

    UiFormSelectInputControlPrototype.compareValues = function (currentValue, existingValue) {
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

    UiFormSelectInputControlPrototype.isEmpty = function () {
        var value = this.getValue();
        return value === null || value === undefined || value === "";
    };

    // ---------------------------------------------------------------------------------------------------------------

    // UiFormSelectInputControl.Option
    P.UiFormSelectInputControl.Option = UiFormSelectInputControlOption;
    /* @constructor */function UiFormSelectInputControlOption(value, displayName) {
        /// <summary>
        /// This is a holder object which contains the display translation string and the javascript object.
        /// </summary>
        this.value = value;
        this.displayName = displayName || String(value);
    };

    
    UiFormSelectInputControl.Option.__class = true;
    

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var UiFormSelectInputControlOptionPrototype = P.UiFormSelectInputControl.Option.prototype;

});
