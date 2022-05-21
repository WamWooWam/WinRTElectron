
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,Debug,People,document,Include*/

Include.initializeFileScope(function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = People;
    var U = People.UnitTest;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    function _trim(value) {
        /// <param name="value" type="String" />
        if (value) {
            return value.replace(/^\s+|\s+$/g, '');
        }
        return value;
    }

    var emptyFieldList = {};
    var testFieldList = {
        // Name
        title: { group: 'name', mustEdit: true },
        firstName: { group: 'name', required: true, validators: ['specialNameChars', 'noWwwHttp'] },
        middleName: { group: 'name', mustEdit: true },
        lastName: { group: 'name', required: true, validators: ['specialNameChars', 'noWwwHttp'] },
        suffix: { group: 'name', mustEdit: true },
        yomiFirstName: { group: 'name' },
        yomiLastName: { group: 'name' },
        // Contact Info
        birthdate: { group: 'contactInfo', type: 'date', minYear: 1900 },
        anniversary: { group: 'contactInfo', type: 'date', minYear: 1900 },
        significantOther: { group: 'contactInfo', mustEdit: true },
        homePhoneNumber: { group: 'contactInfo', type: 'tel', mustEdit: true },
        mobilePhoneNumber: { group: 'contactInfo', type: 'tel', mustEdit: true },
        homeFaxNumber: { group: 'contactInfo', type: 'tel', mustEdit: true },
        personalEmailAddress: { group: 'contactInfo', type: 'email', mustEdit: true, validators: ['email'] },
        homeLocation: { group: 'contactInfo', type: 'mapLocation', mustEdit: true,
            fields: {
                street: { mustEdit: true, lines: 2 },
                city: { mustEdit: true },
                state: { mustEdit: true },
                zipCode: { mustEdit: true },
                country: { mustEdit: true }
            }
        },
        // Work Info
        jobTitle: { group: 'workInfo', mustEdit: true }, // M2
        company: { group: 'workInfo', mustEdit: true }, // M2
        yomiCompanyName: { group: 'workInfo' },
        businessPhoneNumber: { group: 'workInfo', type: 'tel', mustEdit: true },
        pagerNumber: { group: 'workInfo', type: 'tel', mustEdit: true },
        businessFaxNumber: { group: 'workInfo', type: 'tel', mustEdit: true },
        businessEmailAddress: { group: 'workInfo', type: 'email', mustEdit: true, validators: ['email'] },
        businessLocation: { group: 'workInfo', type: 'mapLocation', mustEdit: true,
            fields: {
                street: { mustEdit: true, lines: 2 },
                city: { mustEdit: true },
                state: { mustEdit: true },
                zipCode: { mustEdit: true },
                country: { mustEdit: true }
            }
        }
    };

    var emptyGroupList = {};
    var testGroupList = {
        name: { disallowFieldTypeChange: true },
        contactInfo: {},
        workInfo: {}
    };

    function decorateGroupList(fieldList, groupList) {
        for (var fieldName in fieldList) {
            var group = fieldList[fieldName].group;
            if (group && groupList[group]) {
                if (!groupList[group].fieldList) {
                    groupList[group].fieldList = [];
                }

                groupList[group].fieldList.push(fieldName);
            }
        }
    }

    decorateGroupList(testFieldList, testGroupList);

    function _getString(locId) {
        return locId;
    }

    var throwOnAssert = null;
    function setup () {
        
        throwOnAssert = Debug.throwOnAssert;
        Debug.throwOnAssert = true;
        
        if (!Jx.app) {
            Jx.app = new Jx.Application();
        }
        if (!Jx.loc) {
            Jx.loc = {
                getString: function () { return 'not initialized'; }
            };
        }
    }

    function cleanup () {
        
        Debug.throwOnAssert = throwOnAssert;
        
    }

    function getUiFormInputControls (tc, container, uiForm, inputFields) {
        var fieldMap = uiForm._fieldMap;
        for (var fieldName in fieldMap) {
            var map = fieldMap[fieldName];
            if (map.visible && map.container && map.inputControl) {
                var name = fieldName.replace('/', '$');
                tc.isTrue(!inputFields[name]);

                inputFields[fieldName] = map.inputControl;
            }
        }

        return inputFields;
    }

    function findChildWithId (container, expectedId) {
        for (var idx = 0, len = container.children.length; idx < len; idx++) {
            var child = container.children.item(idx);
            if (child.id === expectedId) {
                return child;
            } else if (child.hasChildNodes()) {
                var found = findChildWithId(child, expectedId);
                if (found) {
                    return found;
                }
            }
        }

        return null;
    }


    Tx.test("UiEditFormTests.test_CheckDefaultArgs", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var formData = {};
        var uiForm = new P.UiForm(formData);

        tc.isTrue(uiForm._formData === formData, 'Validate that the passed on config object has been assigned');
        tc.isNull(uiForm.fieldList, 'Validate that the fieldList is unassigned');
        tc.isNull(uiForm.groupList, 'Validate that the groupList is unassigned');
        tc.isNull(uiForm._loc);
        tc.isNotNull(uiForm._fieldMap);
        tc.isNotNull(uiForm._groupMap);
        tc.areEqual(uiForm._cssPrefix, "uiform-", "Check Default css Prefix");
    });

    Tx.test("UiEditFormTests.test_CheckInitArgs", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var uiForm = new P.UiForm({
            fieldList: testFieldList,
            groupList: testGroupList,
            loc: { getString: _getString },
            cssPrefix: "testForm-"
        });

        tc.isNotNull(uiForm._formData, 'Validate that the passed on config object has been assigned');
        tc.areEqual(uiForm.fieldList, testFieldList, 'Validate that the fieldList is assigned');
        tc.areEqual(uiForm.groupList, testGroupList, 'Validate that the groupList is assigned');
        tc.isNotNull(uiForm._loc);
        tc.areEqual(uiForm._loc.getString, _getString, "Validate that the localizer is assigned");
        tc.isNotNull(uiForm._fieldMap);
        tc.isNotNull(uiForm._groupMap);
        tc.areEqual(uiForm._cssPrefix, "testForm-", "Check css Prefix is assigned");
    });

    Tx.test("UiEditFormTests.test_CheckEditWithNoFieldsNullObject", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var myDiv = document.createElement('div');

        var uiForm = new P.UiForm({
            fieldList: emptyFieldList,
            groupList: emptyGroupList,
            loc: { getString: _getString },
            cssPrefix: "testForm-"
        });

        uiForm.createEditForm(myDiv, null, null);

        // The div should now have child elements
        tc.isTrue(myDiv.hasChildNodes(), 'Validate that the div has been altered');

        var form = myDiv.querySelector("#editForm");
        tc.isNotNull(form);
    });

    Tx.test("UiEditFormTests.test_CheckEditWithNoFieldsEmptyObject", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var myDiv = document.createElement('div');

        var uiForm = new P.UiForm({
            fieldList: emptyFieldList,
            groupList: emptyGroupList,
            loc: { getString: _getString },
            cssPrefix: "testForm-"
        });

        uiForm.createEditForm(myDiv, {}, null);

        // The div should now have child elements
        tc.isTrue(myDiv.hasChildNodes(), 'Validate that the div has been altered');

        var form = myDiv.querySelector("#editForm");
        tc.isNotNull(form);
    });

    Tx.test("UiEditFormTests.test_CheckEditWithFieldsNullObject", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var myDiv = document.createElement('div');

        var uiForm = new P.UiForm({
            fieldList: testFieldList,
            groupList: testGroupList,
            loc: { getString: _getString },
            cssPrefix: "testForm-"
        });

        uiForm.createEditForm(myDiv, null, null);

        // The div should now have child elements
        tc.isTrue(myDiv.hasChildNodes(), 'Validate that the div has been altered');

        var form = myDiv.querySelector("#editForm");
        tc.isNotNull(form);
    });

    Tx.test("UiEditFormTests.test_CheckEditWithFieldsEmptyObject", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var myDiv = document.createElement('div');

        var uiForm = new P.UiForm({
            fieldList: testFieldList,
            groupList: testGroupList,
            loc: { getString: _getString },
            cssPrefix: "testForm-"
        });

        uiForm.createEditForm(myDiv, {}, null);

        // The div should now have child elements
        tc.isTrue(myDiv.hasChildNodes(), 'Validate that the div has been altered');

        var form = myDiv.querySelector("#editForm");
        tc.isNotNull(form);
    });

    Tx.test("UiEditFormTests.test_CheckDehydrationWithNoChanges", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var myDiv = document.createElement('div');

        var mockProvider = new U.TestMockIMePeople();
        var testPerson = mockProvider.getIMe('fred01');

        var uiForm = new P.UiForm({
            fieldList: testFieldList,
            groupList: testGroupList,
            loc: { getString: _getString },
            cssPrefix: "testForm-"
        });

        uiForm.createEditForm(myDiv, testPerson, null);

        // The div should now have child elements
        tc.isTrue(myDiv.hasChildNodes(), 'Validate that the div has been altered');

        var form = myDiv.querySelector("#editForm");
        tc.isNotNull(form);

        var hydrationData = uiForm.dehydrateEditForm(testPerson);
        tc.isTrue(hydrationData !== undefined);
        tc.isNotNull(hydrationData);
        tc.isTrue(hydrationData.fields !== undefined);
        tc.isNotNull(hydrationData.fields);
        tc.isTrue(hydrationData.displayedFields !== undefined);
        tc.isNotNull(hydrationData.displayedFields);

        tc.isTrue(Object.keys(hydrationData.fields).length === 0, "Make sure there are no elements in the hydrated fields");
        tc.isTrue(Object.keys(hydrationData.displayedFields).length > 0, "Make sure there are some fields being displayed");
    });

    Tx.test("UiEditFormTests.test_CheckDehydrationWithEmptyObjectAndNoChanges", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var myDiv = document.createElement('div');

        var testPerson = {};

        var uiForm = new P.UiForm({
            fieldList: testFieldList,
            groupList: testGroupList,
            loc: { getString: _getString },
            cssPrefix: "testForm-"
        });

        uiForm.createEditForm(myDiv, testPerson, null);

        // The div should now have child elements
        tc.isTrue(myDiv.hasChildNodes(), 'Validate that the div has been altered');

        var form = myDiv.querySelector("#editForm");
        tc.isNotNull(form);

        var hydrationData = uiForm.dehydrateEditForm(testPerson);
        tc.isTrue(hydrationData !== undefined);
        tc.isNotNull(hydrationData);
        tc.isTrue(hydrationData.fields !== undefined);
        tc.isNotNull(hydrationData.fields);
        tc.isTrue(hydrationData.displayedFields !== undefined);
        tc.isNotNull(hydrationData.displayedFields);

        tc.isTrue(Object.keys(hydrationData.fields).length === 0, "Make sure there are no elements in the hydrated fields");
        tc.isTrue(Object.keys(hydrationData.displayedFields).length > 0, "Make sure there are some fields being displayed");
    });

    Tx.test("UiEditFormTests.test_CheckFieldSaveDirtyAndContents", function (tc) {
        tc.cleanup = cleanup;
        setup();

        function _getNewValue(value) {
            var lowerName = value.toLowerCase();
            if (lowerName.indexOf("email") !== -1) {
                return value + "@abc.com";
            } else if (lowerName.indexOf("zipcode") !== -1) {
                return "98052";
            } else if (lowerName.indexOf("birthdate") !== -1) {
                return new Date(1968, 10, 21);
            } else if (lowerName.indexOf("anniversary") !== -1) {
                return new Date(2000, 11, 1);
            } else if (lowerName.indexOf("homelocation") !== -1 || lowerName.indexOf("businesslocation") !== -1 || lowerName.indexOf("otherlocation") !== -1) {
                return {
                    street: lowerName + '-street',
                    city: lowerName + '-city',
                    state: lowerName + '-state',
                    zipCode: lowerName + '-zipCode',
                    country: lowerName + '-country'
                };
            }
            return value;
        }

        var myDiv = document.createElement('div');

        var mockProvider = new U.TestMockIMePeople();
        var testPerson = mockProvider.getIMe('fred01');
        testPerson.birthdate = new Date(2011, 1, 1);
        testPerson.anniversary = new Date(2011, 2, 2);

        var uiForm = new P.UiForm({
            fieldList: testFieldList,
            groupList: testGroupList,
            loc: { getString: _getString },
            cssPrefix: "testForm-"
        });

        uiForm.createEditForm(myDiv, testPerson, null);

        // The div should now have child elements
        tc.isTrue(myDiv.hasChildNodes(), 'Validate that the div has been altered');

        var form = myDiv.querySelector("#editForm");
        tc.isNotNull(form);
        tc.isFalse(uiForm.isEditFormDirty(testPerson));

        var inputFields = {};
        var inputControl;
        getUiFormInputControls(tc, myDiv, uiForm, inputFields);
        for (var idx in inputFields) {
            inputControl = inputFields[idx];
            inputControl.setValue(_getNewValue(idx));
        }
        tc.isTrue(uiForm.isEditFormDirty(testPerson));
        tc.isTrue(uiForm.saveEditForm(testPerson));
        tc.isFalse(uiForm.isEditFormDirty(testPerson));

        // Reload test Person (with changes)
        uiForm.createEditForm(myDiv, testPerson, null);
        tc.isFalse(uiForm.isEditFormDirty(testPerson));
        // Check that the display input fields are the same as expected
        var fieldNames = {};
        getUiFormInputControls(tc, myDiv, uiForm, fieldNames);
        for (var fieldName in fieldNames) {
            inputControl = fieldNames[fieldName];
            var lowerName = fieldName.toLowerCase();
            if (lowerName.indexOf("homelocation") !== -1 || lowerName.indexOf("businesslocation") !== -1 || lowerName.indexOf("otherlocation") !== -1) {
                var newValue = _getNewValue(fieldName);
                var inputValue = inputControl.getValue();
                tc.areEqual(newValue.street, inputValue.street);
                tc.areEqual(newValue.city, inputValue.city);
                tc.areEqual(newValue.state, inputValue.state);
                tc.areEqual(newValue.zipCode, inputValue.zipCode);
                tc.areEqual(newValue.country, inputValue.country);
            } else {
                tc.areEqual(String(_getNewValue(fieldName)), String(inputControl.getValue()));
            }
        }

    });

    Tx.test("UiEditFormTests.test_CheckFieldValidationWithSave", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var myDiv = document.createElement('div');

        var mockProvider = new U.TestMockIMePeople();
        var testPerson = mockProvider.getIMe('fred01');

        var uiForm = new P.UiForm({
            fieldList: testFieldList,
            groupList: testGroupList,
            loc: { getString: _getString },
            cssPrefix: "testForm-"
        });

        uiForm.createEditForm(myDiv, testPerson, null);

        tc.isTrue(myDiv.hasChildNodes(), 'Validate that the div has now been altered');
        tc.isFalse(uiForm.isEditFormDirty(testPerson));
        tc.isTrue(uiForm.saveEditForm(testPerson));

        var inputFields = {};
        getUiFormInputControls(tc, myDiv, uiForm, inputFields);
        var field = inputFields.firstName;
        field.setFocus();
        field.setValue("Fred!");

        tc.isTrue(uiForm.isEditFormDirty(testPerson));
        tc.isFalse(uiForm.saveEditForm(testPerson));
        tc.isTrue(uiForm.isEditFormDirty(testPerson));
    });

    Tx.test("UiEditFormTests.test_CheckFieldValidations", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var myDiv = document.createElement('div');

        var testData = {
            firstName: {
                'www.': false,
                'fred!': false,
                'httpfred': false,
                'fred': true,
                ' ': false,
                '12345678901234567890123456789012345678901': true,
                '1234567890123456789012345678901234567890': true
            },
            middleName: {
                'www.': true,
                'fred!': true,
                'httpfred': true,
                'fred': true,
                ' ': true,
                '12345678901234567890123456789012345678901': true,
                '1234567890123456789012345678901234567890': true
            },
            lastName: {
                'www.': false,
                'fred!': false,
                'httpfred': false,
                'fred': true,
                ' ': false,
                '12345678901234567890123456789012345678901': true,
                '1234567890123456789012345678901234567890': true
            },
            businessEmailAddress: {
                '@abc': false,
                'a@abc.com': true,
                'A@abc.com': true,
                'A@abc.com': true,
                'joe+bob@abc.com': true
            }
        };
        for (var fieldName in testData) {
            var data = testData[fieldName];

            var mockProvider = new U.TestMockIMePeople();
            var testPerson = mockProvider.getIMe('fred01');
            var uiForm = new P.UiForm({
                fieldList: testFieldList,
                groupList: testGroupList,
                loc: { getString: _getString },
                cssPrefix: "testForm-"
            });

            uiForm.createEditForm(myDiv, testPerson, null);

            var inputFields = {};
            getUiFormInputControls(tc, myDiv, uiForm, inputFields);

            var field = inputFields[fieldName];
            for (var value in data) {
                field.setFocus();
                field.setValue(value);

                var expectDirty = true;
                if (_trim(value) === testPerson[fieldName]) {
                    expectDirty = false;
                }
                tc.isTrue(expectDirty === uiForm.isEditFormDirty(testPerson));
                if (data[value]) {
                    // expect valid save
                    tc.isTrue(uiForm.saveEditForm(testPerson), "Save " + fieldName + ": [" + value + "]");
                    tc.isFalse(uiForm.isEditFormDirty(testPerson), "Not Dirty " + fieldName + ": [" + value + "]");
                } else {
                    // expect failed save
                    tc.isFalse(uiForm.saveEditForm(testPerson), "NoSave " + fieldName + ": [" + value + "]");
                    tc.isTrue(expectDirty === uiForm.isEditFormDirty(testPerson), "Dirty unchanged " + fieldName + ": [" + value + "] - " + expectDirty);
                }
            }
        }
    });

    Tx.test("UiEditFormTests.test_CheckFormValidator", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var myDiv = document.createElement('div');

        var validationFieldList = {
            // Name
            title: { group: 'name', mustEdit: true },
            firstName: { group: 'name', required: true, validators: ['specialNameChars', 'noWwwHttp'] },
            middleName: { group: 'name', mustEdit: true },
            lastName: { group: 'name', required: true, validators: ['specialNameChars', 'noWwwHttp'] },
            suffix: { group: 'name', mustEdit: true }
        };
        var validationGroupList = {
            name: { disallowFieldTypeChange: true }
        };
        decorateGroupList(validationFieldList, validationGroupList);

        var validatorCalled = false;
        var validatorReturnValue = false;

        function _validator(uiform, obj, loc) {
            validatorCalled = true;

            return validatorReturnValue;
        }

        var mockProvider = new U.TestMockIMePeople();
        var testPerson = mockProvider.getIMe('fred01');

        tc.isFalse(validatorCalled, "Conform that the form validator has not been called");
        var uiForm = new P.UiForm({
            fieldList: testFieldList,
            groupList: testGroupList,
            loc: { getString: _getString },
            cssPrefix: "testForm-",
            formValidator: _validator
        });

        tc.isFalse(validatorCalled, "Conform that the form validator has not been called");
        uiForm.createEditForm(myDiv, testPerson, null);

        tc.isFalse(validatorCalled, "Conform that the form validator has not been called");

        tc.isFalse(uiForm.saveEditForm(testPerson));
        tc.isTrue(validatorCalled, "Conform that the form validator was called");
        validatorReturnValue = true;
        tc.isTrue(uiForm.saveEditForm(testPerson));
    });

    Tx.test("UiEditFormTests.test_CheckHydration", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var mockProvider = new U.TestMockIMePeople();

        var testData = {
            fred01: {
                firstName: "Fred and Wilma",
                middleName: "XXXX",
                lastName: "Flintstone III"
            },
            barney01: {
                firstName: "Barney and Betty",
                middleName: "YYY",
                lastName: "Rubble 2nd"
            },
            acme01: {
                firstName: "Deep",
                middleName: "",
                lastName: "Purple"
            }
        };

        for (var id in testData) {
            var testPerson = mockProvider.getIMe(id);
            var testCaseData = testData[id];

            var myDiv = document.createElement('div');
            var uiForm = new P.UiForm({
                fieldList: testFieldList,
                groupList: testGroupList,
                loc: { getString: _getString },
                cssPrefix: "testForm-"
            });

            uiForm.createEditForm(myDiv, testPerson, null);
            
            var inputName, input;

            // Modify Form Data (Should end up in the hydrated data)
            for (var fieldName in testCaseData) {
                inputName = 'editInput_' + fieldName;
                input = findChildWithId(myDiv, inputName);
                input.value = testCaseData[fieldName];
            }

            // Dehydrate the form
            var hydrationContext = uiForm.dehydrateEditForm(testPerson);

            var myDivHydrated = document.createElement('div');

            var uiFormHydrated = new P.UiForm({
                fieldList: testFieldList,
                groupList: testGroupList,
                loc: { getString: _getString },
                cssPrefix: "testForm-"
            });

            uiFormHydrated.createEditForm(myDivHydrated, testPerson, hydrationContext);

            for (fieldName in testCaseData) {
                inputName = 'editInput_' + fieldName;
                input = findChildWithId(myDivHydrated, inputName);
                tc.areEqual(input.value, testCaseData[fieldName]);
            }
        }
    });
});