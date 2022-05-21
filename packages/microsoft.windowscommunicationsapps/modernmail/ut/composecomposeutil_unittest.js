
(function () {
    /// <summary>Tests Compose.ComposeUtil</summary>

    var composeUtil = Compose.util,
        _preserver;

    function setUp() {
        _preserver = Jm.preserve();
        var preserve = _preserver.preserve.bind(_preserver);

        preserve(Compose, "platform");

        // Throw (and fail unit tests) on asserts
        if (window.Debug) {
            preserve(Debug, "throwOnAssert");
            Debug.throwOnAssert = true;
        }
    };

    function tearDown() {
        _preserver.restore();
    };

    Tx.test("ComposeUtil.testIsValidCalendarAction", { owner: "eihash", priority: 0 }, function (tc) {
        /// <summary>Verifies isValidCalendarAction</summary>
        tc.tearDown = tearDown;
        setUp();

        // Valid values
        tc.isTrue(composeUtil.isValidCalendarAction(Compose.CalendarActionType.reply), "reply");
        tc.isTrue(composeUtil.isValidCalendarAction(Compose.CalendarActionType.replyAll), "replyAll");
        tc.isTrue(composeUtil.isValidCalendarAction(Compose.CalendarActionType.forward), "forward");
        //tc.isTrue(composeUtil.isValidCalendarAction(Compose.CalendarActionType.accept), "accept");
        //tc.isTrue(composeUtil.isValidCalendarAction(Compose.CalendarActionType.tentative), "tentative");
        //tc.isTrue(composeUtil.isValidCalendarAction(Compose.CalendarActionType.decline), "decline");
        tc.isTrue(composeUtil.isValidCalendarAction(Compose.CalendarActionType.cancel), "cancel");

        // Some invalid values
        tc.isFalse(composeUtil.isValidCalendarAction(null), "null");
        tc.isFalse(composeUtil.isValidCalendarAction(), "undefined");
        tc.isFalse(composeUtil.isValidCalendarAction(1235), "Random number");
        tc.isFalse(composeUtil.isValidCalendarAction("sdlkfjslifj"), "Random string");
        tc.isFalse(composeUtil.isValidCalendarAction(new Date()), "Date");
    });

    Tx.test("ComposeUtil.testConvertToComposeAction", { owner: "eihash", priority: 0 }, function (tc) {
        tc.tearDown = tearDown;
        setUp();

        // Only verifying valid actions here due to the assert - this function shouldn't be called with invalid values.

        tc.areEqual(Compose.ComposeAction.reply, composeUtil.convertToComposeAction(Compose.CalendarActionType.reply), "reply");
        tc.areEqual(Compose.ComposeAction.replyAll, composeUtil.convertToComposeAction(Compose.CalendarActionType.replyAll), "replyAll");
        tc.areEqual(Compose.ComposeAction.forward, composeUtil.convertToComposeAction(Compose.CalendarActionType.forward), "forward");
        //tc.areEqual(Compose.ComposeAction.reply, composeUtil.convertToComposeAction(Compose.CalendarActionType.accept), "accept");
        //tc.areEqual(Compose.ComposeAction.reply, composeUtil.convertToComposeAction(Compose.CalendarActionType.tentative), "tentative");
        //tc.areEqual(Compose.ComposeAction.reply, composeUtil.convertToComposeAction(Compose.CalendarActionType.decline), "decline");
        tc.areEqual(Compose.ComposeAction.replyAll, composeUtil.convertToComposeAction(Compose.CalendarActionType.cancel), "cancel");
    });
})();