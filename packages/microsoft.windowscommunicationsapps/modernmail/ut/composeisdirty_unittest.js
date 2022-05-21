
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Compose, Jx, Tx, Microsoft*/

(function () {
    var originalFromControl = window.FromControl,
        originalPlatform = Compose.platform,
        originalAddressWell = window.AddressWell,
        originalGetHeaderController = Compose.util.getHeaderController;

    function stubPlatform(tc) {
        // Mock the platform
        Compose.platform = {
            mailManager: {
                createDraftMessage: function () {
                    return {
                        removeRightsManagementTemplate: Jx.fnEmpty,
                        setRightsManagementTemplate: Jx.fnEmpty
                    };
                }
            }
        };

        tc.addCleanup(function () {
            Compose.platform = originalPlatform;
        });
    }

    function stubHeaderController(tc) {
        // Mock getHeaderController
        Compose.util.getHeaderController = function () {
            return {
                setDefaultState: Jx.fnEmpty,
                getCurrentState: function () {
                    return "FakeHeaderState";
                }
            };
        };

        tc.addCleanup(function () {
            Compose.util.getHeaderController = originalGetHeaderController;
        });
    }

    Tx.test("ComposeIsDirty.test_attachmentWellIsDirty", { owner: "nthorn", priority: 0 }, function (tc) {
        // Create the attachment well object
        var attachmentWell = new Compose.AttachmentWell();

        // Test with an empty attachment well module
        attachmentWell._attachmentWellModule = null;
        tc.isFalse(attachmentWell.isDirty(), "Attachment Well should not report dirty if it has no module");

        // Test that the Compose Component just passes on the value of the module
        attachmentWell._attachmentWellModule = { isDirty: false };
        tc.isFalse(attachmentWell.isDirty(), "Attachment Well should report the same dirty value as its module.");
        attachmentWell._attachmentWellModule = { isDirty: true };
        tc.isTrue(attachmentWell.isDirty(), "Attachment Well should report the same dirty value as its module.");
    });

    Tx.test("ComposeIsDirty.test_bodyIsDirty", { owner: "nthorn", priority: 0 }, function (tc) {
        // Create the body object
        var body = new Compose.BodyComponent();

        // Test that the Compose Component just passes on the value of the dirty tracker
        body._dirtyTracker = { isDirty: false };
        tc.isFalse(body.isDirty(), "Body should report the same dirty value as its dirty tracker.");
        body._dirtyTracker = { isDirty: true };
        tc.isTrue(body.isDirty(), "Body should report the same dirty value as its dirty tracker.");
    });

    Tx.test("ComposeIsDirty.test_fromControlIsDirty", { owner: "nthorn", priority: 0 }, function (tc) {
        tc.addCleanup(function () {
            window.FromControl = originalFromControl;
        });
        stubPlatform(tc);

        // Mock the From Control object
        window.FromControl = {
            FromControl: function () {
                this.activateUI = Jx.fnEmpty;
                this.refresh = function () {
                    return false;
                };
                this.disabled = false;
                this.select = function (accountId, emailAddress) {
                    this.selectedEmailAddress = emailAddress;
                    this.selectedAccount = { objectId: accountId };
                };
                this.selectedEmailAddress = null;
                this.selectedAccount = null;
            }
        };

        // Create and activate the Compose Component
        var from = Compose.UnitTest.initializeComponent(tc, Compose.From);
        from._mailMessageModel = Compose.UnitTest.createMessageModel({ fromEmail: "someone@example.com", accountId: "fakeaccountid" });
        from.updateUI();

        // Check that isDirty is false
        tc.isFalse(from.isDirty(), "From control should start as not dirty");

        // Change the value and check that isDirty is true
        from._fromControl.selectedEmailAddress = "someoneelse@example.com";
        tc.isTrue(from.isDirty(), "From control should be considered dirty when its value changes.");

        // Call UpdateUI again and make sure isDirty is back to false
        from._mailMessageModel = Compose.UnitTest.createMessageModel({ fromEmail: "someonecompletelynew@example.com", accountId: "fakeaccountid" });
        from.updateUI();
        tc.isFalse(from.isDirty(), "From control should be reset to not dirty when it is reinitialized.");
    });

    Tx.test("ComposeIsDirty.test_irmChooserIsDirty", { owner: "nthorn", priority: 0 }, function (tc) {
        stubPlatform(tc);

        // Stub the list of templates that are used in this test
        // The actual code uses a list object, so we mock the extra functions out here
        var templateList = [
            { name: "Mock Template 1", id: "mt1" },
            { name: "Mock Template 2", id: "mt2" }
        ];
        templateList.count = templateList.length;
        templateList.item = function (index) {
            return this[index];
        };
        
        // Stub out more of the platform
        Compose.platform.accountManager = {
            loadAccount: function () {
                return {
                    // Mock Account object
                    getServerByType: function () {
                        return {
                            rightsManagementTemplates: templateList
                        };
                    }
                };
            }
        };

        // Create the Compose Component
        var irmChooser = Compose.UnitTest.initializeComponent(tc, Compose.IrmChooser),
            mockHeaderController = {
                getCurrentState: function () {
                    return Compose.HeaderController.State.editFull;
                }
            };
        irmChooser._mailMessageModel = Compose.UnitTest.createMessageModel({ irmCanRemoveRightsManagement: true });
        irmChooser._componentCache.getComponent = function (name) {
            tc.areEqual("Compose.HeaderController", name, "Invalid test setup: Expected Irm Chooser to only ask for the HeaderController component. Refactoring this test may be required.");
            return mockHeaderController;
        };
                
        // Call UpdateUI to initialize the component
        irmChooser.updateUI();

        // Test that it starts not dirty
        tc.isFalse(irmChooser.isDirty(), "Irm Chooser should start not dirty.");

        // Change the value and check that isDirty is true
        var chooserElement = irmChooser.getComposeRootElement().querySelector(".composeIrmField");
        chooserElement.value = "mt2";
        irmChooser._irmValueChanged();
        tc.isTrue(irmChooser.isDirty(), "Irm Chooser should be dirty after the value is changed.");
        
        // Call UpdateUI again and make sure isDirty is back to false
        irmChooser._mailMessageModel = Compose.UnitTest.createMessageModel();
        irmChooser.updateUI();
        tc.isFalse(irmChooser.isDirty(), "Irm Chooser should return to dirty after UpdateUI is called.");
    });

    Tx.test("ComposeIsDirty.test_priorityIsDirty", { owner: "nthorn", priority: 0 }, function (tc) {
        stubPlatform(tc);
        stubHeaderController(tc);

        // Create and activate the Compose Component
        var priority = Compose.UnitTest.initializeComponent(tc, Compose.Priority),
            priorities = Microsoft.WindowsLive.Platform.MailMessageImportance;
        priority._mailMessageModel = Compose.UnitTest.createMessageModel({ importance: priorities.high });
        priority.updateUI();

        // Check that isDirty is false
        tc.isFalse(priority.isDirty(), "Priority should start as not dirty");

        // Change the value and check that isDirty is true
        priority._priorityField.value = priorities.low;
        priority._priorityValueChanged();
        tc.isTrue(priority.isDirty(), "Priority should be considered dirty when its value changes.");

        // Call UpdateUI again and make sure isDirty is back to false
        priority._mailMessageModel = Compose.UnitTest.createMessageModel({ importance: priorities.normal });
        priority.updateUI();
        tc.isFalse(priority.isDirty(), "Priority should be reset to not dirty when it is reinitialized.");
    });

    Tx.test("ComposeIsDirty.test_subjectIsDirty", { owner: "nthorn", priority: 0 }, function (tc) {
        stubPlatform(tc);

        // Create and activate the Compose Component
        var subject = Compose.UnitTest.initializeComponent(tc, Compose.Subject);
        subject._mailMessageModel = Compose.UnitTest.createMessageModel({ subject: "Some subject" });
        subject.updateUI();

        // Check that isDirty is false
        tc.isFalse(subject.isDirty(), "Subject should start as not dirty");

        // Change the value and check that isDirty is true
        subject._subjectLine.value = "Some different subject";
        tc.isTrue(subject.isDirty(), "Subject should be considered dirty when its value changes.");

        // Call UpdateUI again and make sure isDirty is back to false
        subject._mailMessageModel = Compose.UnitTest.createMessageModel({ subject: "Some totally new subject" });
        subject.updateUI();
        tc.isFalse(subject.isDirty(), "Subject should be reset to not dirty when it is reinitialized.");
    });

    Tx.test("ComposeIsDirty.test_toCcBccIsDirty", { owner: "nthorn", priority: 0 }, function (tc) {
        tc.addCleanup(function () {
            window.AddressWell = originalAddressWell;
        });
        stubPlatform(tc);
        stubHeaderController(tc);

        // Mock the AddressWell object
        window.AddressWell = {
            Controller: function () {
                this._isDirty = false;
                this.getIsDirty = function () {
                    return this._isDirty;
                };
                this.clear = Jx.fnEmpty;
                this.activateUI = Jx.fnEmpty;
                this.addListener = Jx.fnEmpty;
                this.setLabelledBy = Jx.fnEmpty;
                this.resetIsDirty = Jx.fnEmpty;
                this.setAriaFlow = Jx.fnEmpty;
            },
            Events: {
                addressWellBlur: ""
            }
        };

        // Create and activate the Compose Component
        var toCcBcc = Compose.UnitTest.initializeComponent(tc, Compose.ToCcBcc);
        toCcBcc._mailMessageModel = Compose.UnitTest.createMessageModel();
        toCcBcc._updateCcAndBccAriaFlow = Jx.fnEmpty;
        toCcBcc.updateUI();
        toCcBcc.onEntranceComplete();

        // Check that isDirty is false
        tc.isFalse(toCcBcc.isDirty(), "ToCcBcc should start as not dirty");

        // Check that any of the three wells being dirty marks the whole component as dirty
        var controls = toCcBcc._controls;
        controls.to._isDirty = true;
        tc.isTrue(toCcBcc.isDirty(), "ToCcBcc should be considered dirty when any of its address wells are dirty.");
        controls.to._isDirty = false;
        controls.cc._isDirty = true;
        tc.isTrue(toCcBcc.isDirty(), "ToCcBcc should be considered dirty when any of its address wells are dirty.");
        controls.cc._isDirty = false;
        controls.bcc._isDirty = true;
        tc.isTrue(toCcBcc.isDirty(), "ToCcBcc should be considered dirty when any of its address wells are dirty.");
        controls.bcc._isDirty = false;

        // Make sure the component reports as not dirty when all address wells are set back to clean
        tc.isFalse(toCcBcc.isDirty(), "ToCcBcc should not be considered dirty if all of its address wells are not dirty.");

        // Make sure the component resets the dirty flag on its address wells when reinitialized
        Object.keys(controls).forEach(function (type) {
            controls[type]._resetIsDirtyWasCalled = false;
            controls[type].resetIsDirty = function () {
                controls[type]._resetIsDirtyWasCalled = true;
            };
        });
        toCcBcc.updateUI();
        toCcBcc.onEntranceComplete();
        tc.isTrue(controls.to._resetIsDirtyWasCalled, "Expected resetIsDirty to be called on all AddressWells during reinitialization of ToCcBcc");
        tc.isTrue(controls.cc._resetIsDirtyWasCalled, "Expected resetIsDirty to be called on all AddressWells during reinitialization of ToCcBcc");
        tc.isTrue(controls.bcc._resetIsDirtyWasCalled, "Expected resetIsDirty to be called on all AddressWells during reinitialization of ToCcBcc");
    });

    Tx.test("ComposeIsDirty.test_composeImplIsDirty", { owner: "nthorn", priority: 0 }, function (tc) {
        stubPlatform(tc);

        // Create and activate the Compose Component
        var impl = Compose.UnitTest.initializeComponent(tc, Compose.ComposeImpl);
        impl._mailMessageModel = Compose.UnitTest.createMessageModel();
        impl.updateUI();

        // Check that isDirty is false
        tc.isFalse(impl.isDirty(), "Compose should not be dirty with no children");

        // Add a some children and check that it's still not dirty
        var child1 = new Compose.Component(),
            child2 = new Compose.Component(),
            child3 = new Compose.Component();
        impl.addComponent(child1);
        impl.addComponent(child2);
        impl.addComponent(child3);
        tc.isFalse(impl.isDirty(), "Compose Components should always default to not dirty");

        // Mark the entire Compose as dirty and check that it reports dirty
        impl.setDirtyState(true);
        tc.isTrue(impl.isDirty(), "When set as dirty, Compose should always report dirty regardless of child states");

        // Ensure that the state can be set back to false
        impl.setDirtyState(false);
        tc.isFalse(impl.isDirty(), "Compose dirty state did not reset properly");

        // Mark one child as dirty and make sure Compose reports dirty
        child2.isDirty = function () {
            return true;
        };
        tc.isTrue(impl.isDirty(), "When any child is dirty, Compose should report dirty");
    });

})();
