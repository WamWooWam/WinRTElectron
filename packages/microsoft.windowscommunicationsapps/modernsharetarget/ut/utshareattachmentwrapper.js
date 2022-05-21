
// Copyright (C) Microsoft. All rights reserved.

(function () {
    var _originalJxLog;
    var _originalGetElementById;
    var _originalCreateElement;

    function setup (tc) {
        /// <summary>
        /// Store global state that will be modified by tests
        /// </summary>

        _originalJxLog = Jx.log;
        _originalGetElementById = document.getElementById;
        _originalCreateElement = document.createElement;

        Jx.log = {
            info: function () { },
            verbose: function () { },
            error: function () { }
        };


    };

    function cleanup (tc) {
        /// <summary>
        /// Restore original state
        /// </summary>

        Jx.log = _originalJxLog;
        document.getElementById = _originalGetElementById;
        document.createElement = _originalCreateElement;
    };

    var opt = {
        owner: "nthorn",
        priority: "0"
    };

    opt.description = "Verify that the attachmentWrapper's getUI function creates the expected html and populates ui.html.";
    Tx.test("ShareTarget.ShareAttachmentWrapper.testAttachmentWrapperGetUI", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var ui = {};
        ui.html = null;

        var wrapper = new Share.AttachmentWrapper();
        wrapper.getUI(ui);

        tc.isNotNull(ui.html, "The ui.html property was not populated as expected.");

    });

    opt.description = "Validate that ActivateUI populates the container element.";
    Tx.test("ShareTarget.ShareAttachmentWrapper.testActivateUI", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Mock document.getElement by id for this test
        Element = /*@constructor*/function () { };

        var initAttachmentWellCalled = false;
        initAttachmentWell = function () {
            initAttachmentWellCalled = true;
        };
        
        document.getElementById = function () {
            return new Element();
        };

        var wrapper = new Share.AttachmentWrapper();
        wrapper._uiInitialized = false;
        wrapper._addAttachments = initAttachmentWell;
        wrapper.activateUI();

        tc.isTrue(wrapper._uiInitialized, "UI should have been initialized");
        tc.isTrue(initAttachmentWellCalled, "initAttachmentWell was not called as expected");
        tc.isNotNull(wrapper._containerElement, "The container Element was not populated as expected");
    });

    opt.description = "Tests that UI initialized is reset";
    Tx.test("ShareTarget.ShareAttachmentWrapper.testDeactivateUI", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var wrapper = new Share.AttachmentWrapper();
        wrapper._uiInitialized = true;
        wrapper.deactivateUI();

        tc.isFalse(wrapper._uiInitialized, "UI should have been deactivated");
    });

    opt.description = "Verifies the add attachments method.";
    Tx.test("ShareTarget.ShareAttachmentWrapper.testAddAttachments", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        // Mock the attachment wrapper for this test.
        var initUICalled = false;
        var attachmentWellAppended = false;
        var addCalled = false;

        AttachmentModule = function () {
            this.initUI = function () { initUICalled = true; };
            this.add = function () { addCalled = true; };
        };

        dataPackage = function () {
            this.getStorageItemsAsync = function () {
                return mockPromise;
            };
        }
        
        var mockPromise = {
            then: function () {},
        };
        
        AttachmentWell = {
            ShareAnything: {
                Module: function () {
                    return new AttachmentModule();
                }
            }
        };

        append = function () {
            attachmentWellAppended = true;
        };

        var wrapper = new Share.AttachmentWrapper();
        wrapper.append = append;
        wrapper._dataPackage = new dataPackage;
        wrapper._addAttachments([{ name:"fakefile1" }, { name:"fakefile2" }]);

        tc.isTrue(initUICalled, "InitUI is not called as expected.");
        tc.isTrue(addCalled, "add is not called as expected.");
        tc.isTrue(attachmentWellAppended, "The attachment well is not appended as expected.");
   });

    opt.description = "Verifies that isReady works correctly when the inner attachmentWell doesn't exist.";
    Tx.test("ShareTarget.ShareAttachmentWrapper.testIsReadyNoAttachmentWell", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var wrapper = new Share.AttachmentWrapper();

        tc.isFalse(wrapper.isReady(), "Attachment wrapper should not be ready before files have been added.");
    });

    opt.description = "Verifies isReady returns the correct value if the attachmentWell is still attaching files";
    Tx.test("ShareTarget.ShareAttachmentWrapper.testIsReadyAttaching", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var wrapper = new Share.AttachmentWrapper();
        wrapper.attachmentWell = {
            isAttaching: function () { return true; },
            isTranscoding: function () { return false; }
        };

        tc.isFalse(wrapper.isReady(), "Attachments should not be ready during attaching");
    });

    opt.description = "Verifies isReady returns the correct value if the attachmentWell is ready";
    Tx.test("ShareTarget.ShareAttachmentWrapper.testIsReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var wrapper = new Share.AttachmentWrapper();
        wrapper.attachmentWell = {
            isAttaching: function () { return false; },
            isTranscoding: function () { return false; }
        };

        tc.isTrue(wrapper.isReady(), "Attachments should be ready");
    });
})();
