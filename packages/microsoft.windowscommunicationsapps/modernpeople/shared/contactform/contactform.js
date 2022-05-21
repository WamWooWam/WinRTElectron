
// Copyright (C) Microsoft Corporation.  All rights reserved.

///<reference path="../../Shared/JSUtil/Namespace.js"/>
///<reference path="../../../Shared/Jx/Core/Jx.js"/>
///<reference path="UIForm.js"/>
///<reference path="LocaleHelper.js"/>
///<reference path="Location.js"/>
///<reference path="NameHelper.js"/>
/// <disable>JS2076.IdentifierIsMiscased,JS2026.CapitalizeComments</disable>
/// <dictionary>abch,canonicalize,dedupe,mri,uiform,yomi</dictionary>
/// <dictionary>attr,dedupetype,jajp,Comm</dictionary> Gibberish

Jx.delayDefine(People, ["Contact", "Compare"], function () {

    var P = window.People;
    var Contact = P.Contact = {};

    var _localeHelper = /*@static_cast(P.LocaleHelper)*/null;
    var _nameHelper = /*@static_cast(P.NameHelper)*/null;

    // Comparison results
    var Compare = P.Compare = {
        subset: -1,    // "Redmond, WA" is a subset of "1 Microsoft Way, Redmond, Washington 98052"
        equal: 0,      // "Redmond, WA" is equal to "Redmond, Washington"
        superset: 1,   // Inverse of subset.  "1 Microsoft Way" is a superset of "Microsoft Way"
        different: 2   // "1 Microsoft Way, Redmond WA" and "Redmond WA, 98052" are different
    };

    Contact._formValidator = function (uiform, contact) {
        /// <param name="uiform" type="P.UiForm"/>
        /// <param name="contact" type="Microsoft.WindowsLive.Platform.Contact"/>
        if (!P.UiForm.isEmptyString(contact.firstName) ||
            !P.UiForm.isEmptyString(contact.lastName) ||
            !P.UiForm.isEmptyString(contact.companyName) ||
            !P.UiForm.isEmptyString(contact.personalEmailAddress) ||
            !P.UiForm.isEmptyString(contact.businessEmailAddress) ||
            !P.UiForm.isEmptyString(contact.otherEmailAddress)) {

            return true;
        } else {
            uiform.setFormError(Jx.res.getString("/strings/profile_formValidator_missingFieldsHeader"), Jx.res.getString("/strings/profile_formValidator_missingFields"));

            var editFieldOrder = _editFieldOrder[_localeHelper.locale];
            if (!editFieldOrder) {
                editFieldOrder = _editFieldOrder["firstLast"];
                if (!_nameHelper.IsFirstLast()) {
                    editFieldOrder = _editFieldOrder["lastFirst"];
                }
            }

            var fieldName = editFieldOrder.name[0];
            uiform.setInputFocus(fieldName);

            return false;
        }
    };

    var _getMri = function (contacts) {
        /// <param name="contacts" type="Array"/>
        for (var i = 0; i < contacts.length; i++) {
            var mri = contacts[i].mainMri;
            if ((mri !== null) && (mri !== "")) {
                return mri;
            }
        }
        return "";
    };

    var _viewFieldOrder = {
        firstLast : { // firstName / lastName order
            name: [ "firstName", "lastName", "yomiFirstName", "yomiLastName", "middleName", "title", "suffix" ]
        },
        lastFirst : { // lastName / firstName order
            name: [ "lastName", "firstName", "yomiLastName", "yomiFirstName", "middleName", "title", "suffix" ]
        }
    };

    Contact.viewFieldList = {
        // Name
        firstName: { group: "name", mustEdit: true },
        lastName: { group: "name", mustEdit: true },
        yomiFirstName: { group: "name" },
        yomiLastName: { group: "name" },
        middleName: { group: "name" },
        username: { group: "otherInfo"},
        nickname: { group: "otherInfo" },
        title: { group: "name" },
        suffix: { group: "name" },

        // Email
        windowsLiveEmailAddress: { group: "email", type: "email", dedupetype: "email", canEdit: false },
        personalEmailAddress: { group: "email", type: "email", dedupetype: "email" },  // This must be the first of the email fields that can be edited so that it shows up as the default when you add a new contact
        yahooEmailAddress: { group: "email", type: "email", dedupetype: "email", locId: "fieldTitle_personalEmailAddress" },
        businessEmailAddress: { group: "email", type: "email", dedupetype: "email"},
        otherEmailAddress: { group: "email", type: "email", dedupetype: "email"},
        federatedEmailAddress: { group: "email", type: "email", dedupetype: "email", locId: "fieldTitle_otherEmailAddress" },

        // Phone
        mobilePhoneNumber: { group: "phone", type: "tel", dedupetype: "mobiletel" },
        mobile2PhoneNumber: { group: "phone", type: "tel", dedupetype: "mobiletel" },
        homePhoneNumber: { group: "phone", type: "tel", dedupetype: "hometel"},
        home2PhoneNumber: { group: "phone", type: "tel", dedupetype: "hometel"},
        businessPhoneNumber: { group: "phone", type: "tel", dedupetype: "worktel"},
        business2PhoneNumber: { group: "phone", type: "tel", dedupetype: "worktel"},
        pagerNumber: { group: "phone", type: "number", active: false },
        businessFaxNumber: { group: "phone", type: "number", active: false },
        homeFaxNumber: { group: "phone", type: "number", active: false },

        // Address
        homeLocation: { group: "location", type: "mapLocation"},
        businessLocation: { group: "location", type: "mapLocation"},
        otherLocation: { group: "location", type: "mapLocation"},

        // Other info
        //// Disabling Birthdate and Anniversary since Platform does not support the correct formats yet
        ////birthdate: { group: "otherInfo", active: false },
        significantOther: { group: "otherInfo", active: false },
        ////anniversary: { group: "otherInfo", active: false },
        companyName: { group: "otherInfo", active: false },
        yomiCompanyName: { group: "otherInfo", active: false },
        jobTitle: { group: "otherInfo", active: false },
        officeLocation: { group: "otherInfo", active: false },
        webSite: { group: "otherInfo", type: "url"},
        notes: { group: "otherInfo", active: false, lines: 3 }
    };

    var _viewGroupList = {
        name: { multiple: true, disallowFieldTypeChange: true, canView: false },
        email: { multiple: true },
        phone: { multiple: true },
        location: { multiple: true, showFirstFieldOnGroupEmpty: false },
        otherInfo: { multiple: true, showFirstFieldOnGroupEmpty: false, disallowFieldTypeChange: true }
    };

    Contact._viewGroupList = null;
    Contact.getViewGroupList = function () {
        if (Contact._viewGroupList) {
            return Contact._viewGroupList;
        }

        if (!_localeHelper) {
            _localeHelper = new P.LocaleHelper();
        }
        if (!_nameHelper) {
            _nameHelper = new P.NameHelper(_localeHelper);
        }
        var viewFieldOrder = _viewFieldOrder[_localeHelper.locale];
        if (!viewFieldOrder) {
            viewFieldOrder = _viewFieldOrder["firstLast"];
            if (!_nameHelper.IsFirstLast()) {
                viewFieldOrder = _viewFieldOrder["lastFirst"];
            }
        }

        // This init should only happen when needed
        _processList(Contact.viewFieldList, _viewGroupList, viewFieldOrder);

        Contact._viewGroupList = _viewGroupList;
        return _viewGroupList;
    };

    var _abchFieldMaxLengths = {
        firstName: 40,
        yomiFirstName: 40,
        middleName: 40,
        lastName: 40,
        yomiLastName: 40,
        companyName: 40,
        yomiCompanyName: 40,
        nickname: 40,
        title: 40,
        suffix: 40,

        // Email
        personalEmailAddress: 321,  // This must be the first of the email fields that can be edited so that it shows up as the default when you add a new contact
        businessEmailAddress: 321,
        otherEmailAddress: 321,

        // Phone
        mobilePhoneNumber: 50,
        mobile2PhoneNumber: 50,
        homePhoneNumber: 50,
        home2PhoneNumber: 50,
        businessPhoneNumber: 50,
        business2PhoneNumber: 50,
        pagerNumber: 50,
        businessFaxNumber: 50,
        homeFaxNumber: 50,

        // Map Address
        "homeLocation-street": 64,
        "homeLocation-city": 64,
        "homeLocation-state": 64,
        "homeLocation-zipCode": 64,
        "homeLocation-country": 64,

        "businessLocation-street": 64,
        "businessLocation-city": 64,
        "businessLocation-state": 64,
        "businessLocation-zipCode": 64,
        "businessLocation-country": 64,

        "otherLocation-street": 64,
        "otherLocation-city": 64,
        "otherLocation-state": 64,
        "otherLocation-zipCode": 64,
        "otherLocation-country": 64,

        // Personal info
        ////birthdate: { group: "otherInfo", type: "date", minYear: 1904 },
        ////anniversary: { group: "otherInfo", type: "date", minYear: 1905 },
        jobTitle: 1024,
        significantOther: 1024,

        notes: 1024,
        webSite: 2048,

        // Set the default if the fieldname is not specified to the WLComm limit
        defaultLength: 4096
    };
    var _wlCommFieldMaxLengths = {
        notes: 65535,               // Allow 64kb, the real limit is 1073741823 for WlComm
        defaultLength: 4096
    };

    var _maxLengthFieldMap = {
        WL: _abchFieldMaxLengths,
        ABCH: _abchFieldMaxLengths,
        _WLCOMM : _wlCommFieldMaxLengths
    };

    function _dynamicStringMaxLength(target, fieldName, fieldAttr) {
        /// <param name="target" type="Microsoft.WindowsLive.Platform.Contact"/>
        var sourceId = "ABCH";
        if (target && /*@static_cast(Boolean)*/target.account) {
            sourceId = target.account.sourceId || sourceId;
        }
        var sourceMaxLengths = _maxLengthFieldMap[sourceId];
        if (!sourceMaxLengths) {
            sourceMaxLengths = _maxLengthFieldMap["_WLCOMM"];
        }
        var maxLength = sourceMaxLengths[fieldName];
        if (!maxLength) {
            // try and assign a default
            maxLength = sourceMaxLengths.defaultLength;
        }
        if (!maxLength) {
            return null;
        }
        var value = /*@static_cast(String)*/(target ? target[fieldName] : null);
        if (value) {
            var valueLength = value.length;
            if (valueLength > maxLength) {
                return valueLength;
            }
        }
        return maxLength;
    }

    var _editFieldOrder = {
        firstLast : { // first / last order
            name: [ "firstName", "lastName", "middleName", "companyName", "nickname", "title", "suffix", "yomiFirstName", "yomiLastName", "yomiCompanyName" ]
        },
        lastFirst : { // last / first order
            name: [ "lastName", "firstName", "middleName", "companyName", "nickname", "title", "suffix", "yomiLastName", "yomiFirstName", "yomiCompanyName" ]
        },
        "ja-JP": { // last / first order
            name: [ "lastName", "firstName", "yomiLastName", "yomiFirstName", "companyName", "yomiCompanyName", "nickname", "title", "suffix", "middleName" ]
        }
    };

    var _jajpMarket = function () {
        if (!_localeHelper) {
            _localeHelper = new P.LocaleHelper();
        }

        return _localeHelper.region === "JP";
    };

    Contact.editFieldList = {
        // Name
        firstName: { group: "name", mustEdit: true, maxLength: _dynamicStringMaxLength },
        yomiFirstName: { group: "name", mustEdit: _jajpMarket, maxLength: _dynamicStringMaxLength },
        middleName: { group: "name", maxLength: _dynamicStringMaxLength },
        lastName: { group: "name", mustEdit: true, maxLength: _dynamicStringMaxLength },
        yomiLastName: { group: "name", mustEdit: _jajpMarket, maxLength: _dynamicStringMaxLength },
        companyName: { group: "name", mustEdit: true, maxLength: _dynamicStringMaxLength },
        yomiCompanyName: { group: "name", mustEdit: _jajpMarket, maxLength: _dynamicStringMaxLength },
        nickname: { group: "name", maxLength: _dynamicStringMaxLength },
        title: { group: "name", maxLength: _dynamicStringMaxLength },
        suffix: { group: "name", maxLength: _dynamicStringMaxLength },

        // Email
        personalEmailAddress: { group: "email", type: "email", maxLength: _dynamicStringMaxLength },  // This must be the first of the email fields that can be edited so that it shows up as the default when you add a new contact
        businessEmailAddress: { group: "email", type: "email", maxLength: _dynamicStringMaxLength },
        otherEmailAddress: { group: "email", type: "email", maxLength: _dynamicStringMaxLength },

        // Phone
        mobilePhoneNumber: { group: "phone", type: "tel", maxLength: _dynamicStringMaxLength },
        mobile2PhoneNumber: { group: "phone", type: "tel", maxLength: _dynamicStringMaxLength },
        homePhoneNumber: { group: "phone", type: "tel", maxLength: _dynamicStringMaxLength },
        home2PhoneNumber: { group: "phone", type: "tel", maxLength: _dynamicStringMaxLength },
        businessPhoneNumber: { group: "phone", type: "tel", maxLength: _dynamicStringMaxLength },
        business2PhoneNumber: { group: "phone", type: "tel", maxLength: _dynamicStringMaxLength },
        pagerNumber: { group: "phone", type: "tel", maxLength: _dynamicStringMaxLength },
        businessFaxNumber: { group: "phone", type: "tel", maxLength: _dynamicStringMaxLength },
        homeFaxNumber: { group: "phone", type: "tel", maxLength: _dynamicStringMaxLength },

        // Map Address
        homeLocation: { group: "location", type: "mapLocation", maxLength: _dynamicStringMaxLength },
        businessLocation: { group: "location", type: "mapLocation", maxLength: _dynamicStringMaxLength },
        otherLocation: { group: "location", type: "mapLocation", maxLength: _dynamicStringMaxLength },

        // Personal info
        ////birthdate: { group: "otherInfo", type: "date", minYear: 1904 },
        jobTitle: { group: "otherInfo", maxLength: _dynamicStringMaxLength },
        significantOther: { group: "otherInfo", maxLength: _dynamicStringMaxLength },
        ////anniversary: { group: "otherInfo", type: "date", minYear: 1905 },
        webSite: { group: "otherInfo", type: "url", htmlType: "text", maxLength: _dynamicStringMaxLength },
        notes: { group: "otherInfo", lines: 11, maxLength: _dynamicStringMaxLength }
    };

    var _editGroupList = {
        name: { multiple: true, disallowFieldTypeChange: true, canView: false },
        email: { multiple: true },
        phone: { multiple: true },
        location: { multiple: true, showFirstFieldOnGroupEmpty: false },
        otherInfo: { multiple: true, showFirstFieldOnGroupEmpty: false, disallowFieldTypeChange: true }
    };

    Contact._editGroupList = null;
    Contact.getEditGroupList = function () {
        if (Contact._editGroupList) {
            return Contact._editGroupList;
        }
        if (!_localeHelper) {
            _localeHelper = new P.LocaleHelper();
        }
        if (!_nameHelper) {
            _nameHelper = new P.NameHelper(_localeHelper);
        }
        var editFieldOrder = _editFieldOrder[_localeHelper.locale];
        if (!editFieldOrder) {
            editFieldOrder = _editFieldOrder["firstLast"];
            if (!_nameHelper.IsFirstLast()) {
                editFieldOrder = _editFieldOrder["lastFirst"];
            }
        }
        // This init should only happen when needed
        _processList(Contact.editFieldList, _editGroupList, editFieldOrder);

        Contact._editGroupList = _editGroupList;
        return _editGroupList;
    };

    function _processList(fieldList, groupList, fieldOrder) {
        for (var groupName in groupList) {
            if (!groupList[groupName].fieldList) {
                groupList[groupName].fieldList = [];
            }

            var order = fieldOrder[groupName];
            if (!order) {
                for (var fieldName in fieldList) {
                    var group = fieldList[fieldName].group;
                    if (groupName === group) {
                        groupList[group].fieldList.push(fieldName);
                    }
                }
            } else {
                groupList[groupName].fieldList = order;
            }
        }
    };
    
    Contact.getFieldValue = function (data, fieldName, sourceId) {
        /// <param name="data" type="Microsoft.WindowsLive.Platform.Contact"/>
        var fieldValue;
        if (fieldName === "username") {
            fieldValue = getUsername(data, sourceId);
        } else if (fieldName === "nickname") {
            fieldValue = getNickname(data, sourceId);
        } else {
            fieldValue = data[fieldName];
        }
        return fieldValue;
    };

    function supportsUsername(sourceId) { 
        ///<param name="sourceId" type="String"/>
        ///<returns type="Boolean"/>
        return sourceId === "SKYPE" || sourceId === "TWITR"; 
    }
    function getUsername(data, sourceId) { 
        ///<param name="data" type="Microsoft.WindowsLive.Platform.Contact"/>
        ///<param name="sourceId" type="String"/>
        ///<returns type="String"/>
        var username = "";
        if (supportsUsername(sourceId)) {
            username = data.nickname;
            if (sourceId === "TWITR" && Jx.isNonEmptyString(username) && username.charAt(0) !== "@") {
                username = "@" + username;
            }
        }
        return username;
    }
    function getNickname(data, sourceId) {
        ///<param name="data" type="Microsoft.WindowsLive.Platform.Contact"/>
        ///<param name="sourceId" type="String"/>
        ///<returns type="String"/>
        return supportsUsername(sourceId) ? "" : data.nickname;
    }
 
    Contact.createUniqueFields = function (contacts, type) {
        /// <summary>Creates a list of deduplicated fields from the given contacts.</summary>
        /// <param name="contacts" type="Array">An array of contact objects from which to retrieve data</param>
        /// <param name="type" type="String" optional="true">The type of fields to retrieve.  If not specified, the full set will be returned</param>
        /// <returns type="Array"/>
        var dedupeAll;
        var fieldNames = [];
        if (type) { 
            // When getting fields by type, find all fields of that type and dedupe across the whole list
            dedupeAll = true;
            for (var possibleFieldName in Contact.viewFieldList) {
                if (Contact.viewFieldList[possibleFieldName].type === type ||
                    Contact.viewFieldList[possibleFieldName].dedupetype === type) {
                    fieldNames.push(possibleFieldName);
                }
            }
        } else {
            // Otherwise, we are getting all fields, and will dedupe by dedupetype or fieldName only.
            dedupeAll = false;
            var viewGroupList = Contact.getViewGroupList();
            for (var groupName in viewGroupList) {
                var group = /*@static_cast(_UiFormGroupDef)*/viewGroupList[groupName];
                fieldNames.push.apply(fieldNames, group.fieldList);
            }
        }

        var uniqueFields = [];
        var addresses = [];
        for (var i = 0; i < fieldNames.length; i++) {
            var fieldName = fieldNames[i];
            var field = /*@static_cast(_UiFormFieldAttrib)*/Contact.viewFieldList[fieldName];
            for (var c = 0; c < contacts.length; c++) {
                var contact = /*@static_cast(Microsoft.WindowsLive.Platform.Contact)*/contacts[c];
                var account = null;
                try {
                    account = contact.account;
                } catch (e) {
                    if (e.number !== -2067070973 /*generic WinRTError*/) {
                        throw e;
                    }
                }
                var sourceId = account ? account.sourceId : "";
                var fieldValue = Contact.getFieldValue(contact, fieldName, sourceId);
                if (isFieldEmpty(field.type, fieldValue)) {
                    continue;
                }

                var network = "";
                if ((account !== undefined) && (account !== null)) {
                    if (contact.canEdit && account.isDefault) { 
                        // ABCH contact
                        network = Jx.res.getString("/strings/profile_fieldAttribution_addedByYou");
                    } else {
                        network = account.displayName;
                    }
                }

                addField(uniqueFields, fieldName, fieldValue, field, network, dedupeAll);
            }
        }

        return uniqueFields;
    };

    function isFieldEmpty(type, /*@dynamic*/value) {
        /// <param name="type" type="String">A field type from the field lists above</param>
        /// <returns type="Boolean">True if the value has no value</returns>
        return Jx.isNullOrUndefined(value) ||
               value === "" ||
               (type === "mapLocation" && !P.Location.isValid(value));
    }

    function canonicalizePhoneNumber(value) {
        /// <summary>Strips out common formatting characters from a phone number to aid in comparison. Note that we
        /// don't strip the +.  This is not noise, it is valuable data.</summary>
        /// <param name="value" type="String"/>
        return value.toLowerCase().replace(/[\s\(\)\-.]/g, "");
    }

    function comparePhoneNumber(valueA, valueB) {
        /// <param name="valueA" type="String"/>
        /// <param name="valueB" type="String"/>
        /// <returns type="Number">
        ///   Subset (-1) if a is a subset of b 
        ///   Equal (0) if a is equal to b 
        ///   Superset (1) if a is a superset of b
        ///   Different (2) if they don't match.
        /// </returns>
        var result = Compare.different;
        var canonicalA = canonicalizePhoneNumber(valueA);
        var canonicalB = canonicalizePhoneNumber(valueB);
        if (canonicalA === canonicalB) {
            // If they are equal canonically, the longer one is likely to be prettier (due to some number of formatting
            // characters).
            var lengthA = valueA.length;
            var lengthB = valueB.length;
            if (lengthA === lengthB) { 
                result = Compare.equal;
            } else if (lengthA > lengthB) {
                result = Compare.superset;
            } else {
                result = Compare.subset;
            }
        } else if (canonicalA.indexOf(canonicalB) !== -1) {
            result = Compare.superset;
        } else if (canonicalB.indexOf(canonicalA) !== -1) {
            result = Compare.subset;
        }
        return result;
    }

    function compareField(type, /*@dynamic*/valueA, /*@dynamic*/valueB) {
        /// <summary>Compares 2 fields.</summary>
        /// <param name="type" type="String">A field 'type' as specified in the field lists above</param>
        /// <returns type="Number">
        ///   Subset (-1) if a is a subset of b 
        ///   Equal (0) if a is equal to b 
        ///   Superset (1) if a is a superset of b
        ///   Different (2) if they don't match.
        /// </returns>
        var result = Compare.different;
        switch (type) {
            case "mapLocation": 
                result = P.Location.compare(valueA, valueB);
                break;
            case "tel":
                result = comparePhoneNumber(valueA, valueB);
                break;
            default:
                if (valueA === valueB ||
                    (Jx.isString(valueA) && Jx.isString(valueB) && valueA.toLowerCase() === valueB.toLowerCase())) {
                    result = Compare.equal;
                }
                break;
        }
        return result;
    }

    function addField(uniqueFields, fieldName, /*@dynamic*/fieldValue, fieldType, network, dedupeAll) {
        /// <summary>Adds a field to the list of unique fields, avoiding duplicates.</summary>
        /// <param name="uniqueFields" type="Array"/>
        /// <param name="fieldName" type="String"/>
        /// <param name="fieldValue">Though the value is commonly a string, it may also be a Location</param>
        /// <param name="fieldType" type="_UiFormFieldAttrib"/>
        /// <param name="network" type="String"/>
        /// <param name="dedupeAll" type="Boolean">If true, ignore the "dedupeType" and ensure uniqueness across all fields</param>
        var found = false;
        for (var i = 0; i < uniqueFields.length; i++) {
            var existing = /*@static_cast(_ContactUniqueField)*/uniqueFields[i];

            if (existing.fieldName === fieldName ||  // Always dedupe a field against itself
                (Jx.isDefined(fieldType.dedupetype) && existing.fieldType.dedupetype === fieldType.dedupetype) ||  // For some fields, dedupe by type (homePhone1 versus homePhone2) 
                dedupeAll) { // And sometimes, dedupe everything

                var result = compareField(fieldType.type, fieldValue, existing.fieldValue);

                if (result === Compare.subset) {  // This data is less interesting than data we already have.  Discard it.
                    found = true;
                    break;
                }

                if (result === Compare.equal) {  // This data is the same as data we already have.  Update the attribution.
                    if (existing.fieldNetwork.indexOf(network) === -1) {
                        existing.fieldNetwork.push(network);
                    }
                    found = true;
                    break;
                }

                if (result === Compare.superset) { // This data is more interesting that data we already have.  Discard the existing data and continue.
                    uniqueFields.splice(i, 1);
                    i--;
                }
            }
        }

        if (!found) { // This data was different or better than everything we had.  Add it.
            uniqueFields.push({
                fieldName: fieldName,
                fieldValue: fieldValue,
                fieldType: fieldType,
                fieldNetwork: [network],
                hasDisplayed: false
            });
        }
    }

});
