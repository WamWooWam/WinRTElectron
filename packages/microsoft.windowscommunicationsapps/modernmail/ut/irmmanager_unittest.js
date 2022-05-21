
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    var CalendarMessageType;

    function setUp() {
        Mail.UnitTest.setupCalendarStubs();

        CalendarMessageType = Microsoft.WindowsLive.Platform.CalendarMessageType;
    };

    function tearDown() {  };

    function setupComponents(irmManager, componentList) {
        /// <summary>Helper function initializes current page's components</summary>
        /// <param name="componentList" type="Array">Array of component string identifiers</param>

        var components = {};

        for (var i = 0; i < componentList.length; i++) {
            components[componentList[i]] = {
                setDisabled: function (isDisabled) { this.disabled = isDisabled; }
            };
        }

        irmManager.getComponentCache = function () {
            return {
                getComponent: function (componentId) {
                    return components[componentId];
                }
            }
        }
    }

    function setupMailMessage(irmManager, calendarMessageType, hasTemplate, canModifyRecipients) {
        /// <summary>Helper function initializes current page's message model</summary>


        var messageModel = Jm.mock(Compose.MailMessageModel.prototype);
        var platformMessage = {
            calendarMessageType: calendarMessageType
        };
        Jm.when(messageModel).get("irmHasTemplate").thenReturn(hasTemplate);
        Jm.when(messageModel).get("irmCanModifyRecipients").thenReturn(canModifyRecipients);
        Jm.when(messageModel).getPlatformMessage(Jm.ANY).then(function () { return platformMessage; });

        irmManager.getMailMessageModel = function () { return messageModel; };
    }

    function getFromComponent(irmManager) {
        return irmManager.getComponentCache().getComponent("Compose.From");
    }

    function getToComponent(irmManager) {
        return irmManager.getComponentCache().getComponent("Compose.ToCcBcc");
    }

    Tx.test("IrmManager.test_MissingFromComponent", { owner: "mholden", priority: 0 }, function (tc) {
        // Verifies that the control works correctly when the From component is missing

        tc.cleanup = tearDown;
        setUp();

        var manager = new Mail.IrmManager();

        setupComponents(manager, ["Compose.ToCcBcc"]);
        setupMailMessage(manager, CalendarMessageType.none, false, true);

        // Test is mostly that this doesn't throw
        manager.updateUI();

        tc.isFalse(!!getFromComponent(manager), "Invalid test setup: there should be no from component");
        tc.isFalse(getToComponent(manager).disabled, "To/CC/BCC should not be disabled");
    });

    Tx.test("IrmManager.test_CantModifyRecipients", { owner: "mholden", priority: 0 }, function (tc) {
        /// <summary>Verifies that To/CC/BCC is disabled when you cannot modify recipients</summary>
        tc.cleanup = tearDown;
        setUp();

        var manager = new Mail.IrmManager();

        setupComponents(manager, ["Compose.ToCcBcc", "Compose.From"]);
        setupMailMessage(manager, CalendarMessageType.none, true, false);

        manager.updateUI();

        tc.isTrue(getToComponent(manager).disabled, "To/CC/BCC should be disabled");
    });

    Tx.test("IrmManager.test_CalendarCancel", { owner: "mholden", priority: 0 }, function (tc) {
        /// <summary>Verifies that To/CC/BCC is disabled for calendar cancel</summary>

        tc.cleanup = tearDown;
        setUp();

        var manager = new Mail.IrmManager();

        setupComponents(manager, ["Compose.ToCcBcc", "Compose.From"]);
        setupMailMessage(manager, CalendarMessageType.cancelled, false, true);

        manager.updateUI();

        tc.isTrue(getToComponent(manager).disabled, "To/CC/BCC should be disabled");
    });
})();
