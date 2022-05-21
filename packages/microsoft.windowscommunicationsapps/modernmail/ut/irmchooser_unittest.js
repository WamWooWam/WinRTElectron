
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jm, Compose, Tx, Document, Jx*/

(function () {
    var _preserver,
        _mailMessageModel,
        _irmChooser,
        _labelEl,
        _fieldEl,
        _permissionEl,
        _descriptionEl,
        _chooserEl,
        _originalGetTemplates,
        _getTemplates;

    function setUp() {
        _preserver = Jm.preserve();
        var preserve = _preserver.preserve.bind(_preserver);

        // Mock the doc
        var doc = Compose.doc = Jm.mock(Document.prototype);
        _permissionEl = document.createElement("select");
        Jm.when(doc).querySelector(".composePermissionField").thenReturn(_permissionEl);
        _descriptionEl = document.createElement("div");
        Jm.when(doc).querySelector(".composeIrmDescription").thenReturn(_descriptionEl);
        _chooserEl = document.createElement("div");
        Jm.when(doc).querySelector(".composeIrmChooser").thenReturn(_chooserEl);
        _fieldEl = document.createElement("select");
        Jm.when(doc).querySelector(".composeIrmField").thenReturn(_fieldEl);
        _labelEl = document.createElement("div");
        Jm.when(doc).querySelectorAll(".irmElement").thenReturn([_labelEl, _chooserEl]);

        // Mock Jx.res.getString to just return the string it's given (makes for easy testing).
        preserve(Jx, "res");
        Jx.res = Jm.mock(Jx.Res);
        Jm.when(Jx.res).getString(Jm.ANY).then(function (resId) { return resId; });

        // Create the object
        _irmChooser = new Compose.IrmChooser();
        _irmChooser._componentBinder = { attach: function () { }, detach: function () { }};

        // Mock the mail message model
        _mailMessageModel = Jm.mock(Compose.MailMessageModel.prototype);
        Jm.when(_mailMessageModel).get("accountId").thenReturn("accountId");
        Jm.when(_mailMessageModel).get("irmHasTemplate").thenReturn(true);
        Jm.when(_mailMessageModel).get("irmIsContentOwner").thenReturn(false);
        Jm.when(_mailMessageModel).get("irmCanRemoveRightsManagement").thenReturn(false);
        Jm.when(_mailMessageModel).get("irmTemplateId").thenReturn("1");
        Jm.when(_mailMessageModel).getPlatformMessage().thenReturn({
            removeRightsManagementTemplate: function () { },
            setRightsManagementTemplate: function () { }
        });
        _irmChooser.setMailMessageModel(_mailMessageModel);

        // Mock templates
        _getTemplates = function () {
            var array = [
                { id: "1", name: "Template 1", description: "description 1" },
                { id: "2", name: "Template 2", description: "description 2" },
                { id: "3", name: "Template 3", description: "description 3" },
                { id: "4", name: "Template 4", description: "description 4" },
                { id: "5", name: "Template 5", description: "description 5" },
            ];
            return {
                count: array.length,
                item: function (index) { return array[index]; }
            };
        };
        _originalGetTemplates = _irmChooser._getTemplates;
        _irmChooser._getTemplates = _getTemplates;
        _irmChooser._permissionField = _permissionEl;

        // Mock out the HeaderController object that the irm chooser uses
        _irmChooser.getComponentCache = function () {
            return {
                getComponent: function () {
                    return {
                        isActivated: function () {
                            return true;
                        },
                        changeState: Jx.fnEmpty,
                        getCurrentState: function () {
                            return Compose.HeaderController.State.editFull;
                        }
                    };
                }
            };
        };

    }

    function tearDown() {
        _preserver.restore();
    }

    Tx.test("IrmChooser.test_IrmChooser", { owner: "mholden", priority: 0 }, function (tc) {
        tc.tearDown = tearDown;
        setUp();

        Jm.when(_mailMessageModel).get("irmTemplateId").thenReturn("");

        // Test composeGetUI
        var ui = { html: "", css: "" };
        _irmChooser.composeGetUI(ui);
        tc.isTrue(Jx.isNonEmptyString(ui.html));
        tc.isFalse(Jx.isNonEmptyString(ui.css));

        // Correct classes are applied in composeUpdateUI
        _irmChooser.composeActivateUI();
        _irmChooser._irmTemplateField = _fieldEl;
        _irmChooser.composeUpdateUI();
        tc.areEqual(_chooserEl.className, "");
        tc.isTrue(_irmChooser.isVisible(), "IrmChooser should be visible");

        _irmChooser._getTemplates = function () { return { count: 0 }; };
        _irmChooser.composeUpdateUI();
        tc.areEqual(_chooserEl.className, "hidden");
        _irmChooser.composeDeactivateUI();
    });

    Tx.test("IrmChooser.test_DisabledState", { owner: "mholden", priority: 0 }, function (tc) {
        // Test disabled state
        tc.tearDown = tearDown;
        setUp();

        tc.log("Template with no change permission");
        _irmChooser._irmTemplateField = _fieldEl;
        _irmChooser.setDisabled(false);
        _irmChooser.composeUpdateUI();
        tc.isTrue(_fieldEl.disabled);

        tc.log("No template");
        Jm.when(_mailMessageModel).get("irmHasTemplate").thenReturn(false);
        _irmChooser.composeUpdateUI();
        tc.isFalse(_fieldEl.disabled);
        Jm.when(_mailMessageModel).get("irmHasTemplate").thenReturn(true);

        tc.log("Template and isContentOwner");
        Jm.when(_mailMessageModel).get("irmIsContentOwner").thenReturn(true);
        _irmChooser.composeUpdateUI();
        tc.isFalse(_fieldEl.disabled);
        Jm.when(_mailMessageModel).get("irmIsContentOwner").thenReturn(false);

        tc.log("Template canRemoveRightsManagement");
        Jm.when(_mailMessageModel).get("irmCanRemoveRightsManagement").thenReturn(true);
        _irmChooser.composeUpdateUI();
        tc.isFalse(_fieldEl.disabled);
        Jm.when(_mailMessageModel).get("irmCanRemoveRightsManagement").thenReturn(false);

        tc.log("No template and the control is disabled");
        Jm.when(_mailMessageModel).get("irmHasTemplate").thenReturn(false);
        _irmChooser.composeUpdateUI();
        tc.isFalse(_fieldEl.disabled, "Invalid test setup: control should not be disabled before calling setDisabled");
        _irmChooser.setDisabled(true);
        _irmChooser.composeUpdateUI();
        tc.isTrue(_fieldEl.disabled);
        _irmChooser.setDisabled(false);
        Jm.when(_mailMessageModel).get("irmHasTemplate").thenReturn(true);

        tc.log("setDisabled false after being disabled");
        Jm.when(_mailMessageModel).get("irmHasTemplate").thenReturn(false);
        _irmChooser.setDisabled(true);
        _irmChooser.composeUpdateUI();
        _irmChooser.setDisabled(false);
        _irmChooser.composeUpdateUI();
        tc.isFalse(_fieldEl.disabled);
        Jm.when(_mailMessageModel).get("irmHasTemplate").thenReturn(true);
    });

    Tx.test("IrmChooser.test_SelectionChange", { owner: "mholden", priority: 0 }, function (tc) {
        tc.tearDown = tearDown;
        setUp();

        // Ensure description text is updated when we simulate selection change
        Jm.when(_mailMessageModel).get("irmIsContentOwner").thenReturn(false);
        Jm.when(_mailMessageModel).get("irmCanRemoveRightsManagement").thenReturn(true);
        _irmChooser._irmTemplateField = _fieldEl;
        _irmChooser.composeUpdateUI();
        _irmChooser._irmTemplateField = { value: "2" };
        _irmChooser._irmValueChanged();
        tc.areEqual(_descriptionEl.innerText, "description 2");
        tc.isTrue(_irmChooser.isDirty(), "IrmChooser should be dirty when selected template changes");

        // Ensure _currentTemplate is null for the _noRestrictionValue
        Jm.when(_mailMessageModel).get("irmTemplateId").thenReturn("");
        _irmChooser._irmTemplateField = { value: "-1" };
        _irmChooser._irmValueChanged();
        _irmChooser.updateModel("save");
        tc.isTrue(_irmChooser._currentTemplate === null, "template should be null when value equals _noRestrictionValue");
    });

    Tx.test("IrmChooser.test_AccountWithNoEasServer", { owner: "mholden", priority: 0 }, function (tc) {
        // Ensure functionality of an account with no eas server

        tc.tearDown = tearDown;
        setUp();

        _irmChooser._getTemplates = _originalGetTemplates;
        Compose.platform = {
            accountManager: {
                loadAccount: function () {
                    return {
                        getServerByType: function () {
                            // No server to return
                            return null;
                        }
                    };
                }
            }
        };
        Jm.when(_mailMessageModel).get("irmTemplateId").thenReturn("");
        _irmChooser._irmTemplateField = _fieldEl;
        _irmChooser.composeUpdateUI();
        tc.isTrue(_chooserEl.classList.contains("hidden"));
        tc.isTrue(_irmChooser._currentTemplate === null);
    });

    Tx.test("IrmChooser.test_ClearTemplate", { owner: "mholden", priority: 0 }, function (tc) {
        // Ensure the template is set to null whenever composeUpdateUI is invoked
        tc.tearDown = tearDown;
        setUp();

        _irmChooser._currentTemplate = { id: "id", name: "name", description: "description" };
        Jm.when(_mailMessageModel).get("irmHasTemplate").thenReturn(false);
        _irmChooser._irmTemplateField = _fieldEl;
        _irmChooser.composeUpdateUI();
        tc.isTrue(_irmChooser._currentTemplate === null);
    });

    Tx.test("IrmChooser.test_UnknownTemplate", { owner: "mholden", priority: 0 }, function (tc) {
        // Ensure an unknown template is added to dropdown and is the selected option
        tc.tearDown = tearDown;
        setUp();

        Jm.when(_mailMessageModel).get("irmTemplateId").thenReturn("unknown");
        _irmChooser._currentTemplate = { id: "id", name: "name", description: "description" };
        _irmChooser._irmTemplateField = _fieldEl;
        _irmChooser.composeUpdateUI();
        tc.isTrue(_fieldEl.options.length === 7);
        tc.isTrue(_fieldEl.selectedIndex === 6);
    });

    Tx.test("IrmChooser.test_AccountChange", { owner: "mholden", priority: 0 }, function (tc) {
        // Setup for account change
        tc.tearDown = tearDown;
        setUp();
        _irmChooser._irmTemplateField = _fieldEl;
        _irmChooser._accountId = "differentAccount";
        _irmChooser._getTemplates = function () { return { count: 0 }; };
        Jm.when(_mailMessageModel).get("irmTemplateId").thenReturn("");

        // Invoke account change handler and verify visibility
        _irmChooser._onMessageModelChange();
        tc.isFalse(_irmChooser.isVisible(), "IrmChooser should be invisible");
    });

})();
