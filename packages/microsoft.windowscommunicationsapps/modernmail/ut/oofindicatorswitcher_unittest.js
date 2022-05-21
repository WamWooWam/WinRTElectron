
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {

    var U = Mail.UnitTest;
    var P = Microsoft.WindowsLive.Platform;
    var MP = Mocks.Microsoft.WindowsLive.Platform;

    function mockAccount(id) {
        var resource = {
            displayName: id,
            addEventListener: function () {},
            removeEventListener: function () {}
        };
        return {
            objectId: id,
            displayName: id,
            getResourceByType: function () { return resource; },
            addEventListener: function () {},
            removeEventListener: function () {},
            mockedType : Microsoft.WindowsLive.Platform.Account
        };
    }

    var setUp = function (tc) {
        Mail.UnitTest.stubJx(tc, "res");
    };

    var tearDown = function () {
        Mail.UnitTest.restoreJx();
    };

    Tx.test("OofIndicatorSwitcher_UnitTest.test_calculateTime", function (tc) {
        setUp(tc);
        tc.cleanup = function () {
            tearDown();
        };

        var OofSwitcher = Mail.OofIndicatorSwitcher;
        
        var now = new Date(),
            nowTime = now.getTime(),
            start = new Date(nowTime - 500),
            end = new Date(nowTime + 1000);
        
        var result = OofSwitcher._calculateTime(start, end, now);
        tc.isTrue(result.isNowBetween);
        tc.isTrue(result.timeToNextCheckPoint === 1000);
        
        start = null;
        end = null;
        result = OofSwitcher._calculateTime(start, end, now);
        tc.isTrue(result.isNowBetween);
        tc.isTrue(result.timeToNextCheckPoint === -1);
        
        start = null;
        end = new Date(nowTime - 1000);
        result = OofSwitcher._calculateTime(start, end, now);
        tc.isFalse(result.isNowBetween);
        tc.isTrue(result.timeToNextCheckPoint === -1);            

        start = null;
        end = new Date(nowTime);
        result = OofSwitcher._calculateTime(start, end, now);
        tc.isFalse(result.isNowBetween);
        tc.isTrue(result.timeToNextCheckPoint === -1);            

        start = null;
        end = new Date(nowTime + 1000);
        result = OofSwitcher._calculateTime(start, end, now);
        tc.isTrue(result.isNowBetween);
        tc.isTrue(result.timeToNextCheckPoint === 1000);            

        start = new Date(nowTime - 500);
        end = null;
        result = OofSwitcher._calculateTime(start, end, now);
        tc.isTrue(result.isNowBetween);
        tc.isTrue(result.timeToNextCheckPoint === -1);
        
        start = new Date(nowTime);
        end = null;
        result = OofSwitcher._calculateTime(start, end, now);
        tc.isTrue(result.isNowBetween);
        tc.isTrue(result.timeToNextCheckPoint === -1);            

        start = new Date(nowTime + 3000);
        end = null;
        result = OofSwitcher._calculateTime(start, end, now);
        tc.isFalse(result.isNowBetween);
        tc.isTrue(result.timeToNextCheckPoint === 3000);            

        start = new Date(nowTime - 2000);
        end = new Date(nowTime - 1000);
        result = OofSwitcher._calculateTime(start, end, now);
        tc.isFalse(result.isNowBetween);
        tc.isTrue(result.timeToNextCheckPoint === -1);

        start = new Date(nowTime + 2000);
        end = new Date(nowTime + 4000);
        result = OofSwitcher._calculateTime(start, end, now);
        tc.isFalse(result.isNowBetween);
        tc.isTrue(result.timeToNextCheckPoint === 2000);
        
        // start = end => should be ingored
        start = new Date(nowTime + 4000);
        end = new Date(nowTime + 4000);
        result = OofSwitcher._calculateTime(start, end, now);
        tc.isFalse(result.isNowBetween);
        tc.isTrue(result.timeToNextCheckPoint === -1);

        // start > end => should be ingored
        start = new Date(nowTime + 8000);
        end = new Date(nowTime + 4000);
        result = OofSwitcher._calculateTime(start, end, now);
        tc.isFalse(result.isNowBetween);
        tc.isTrue(result.timeToNextCheckPoint === -1);

    });

})();
