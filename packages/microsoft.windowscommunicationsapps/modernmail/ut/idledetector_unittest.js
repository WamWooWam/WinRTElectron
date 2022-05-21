
(function () {
    var BasePriority = Jx.Scheduler.BasePriority;

    // This test triggers the ETW listener IdleDetector uses to listen for
    // Scheduler jobs, and then fires a scheduler job.  
    Tx.asyncTest("IdleDetetor.testResetOnJobsCompleted", function (tc) {
        tc.stop();
        var s = new Jx.Scheduler();
        var p = s.definePriorities({ A: { base: BasePriority.normal } });
        var oldFunc = window.Mail.IdleDetector.resetIdleSecondsCount;
        var obj = {};
        window.Mail.IdleDetector.resetIdleSecondsCount = function () {
            window.Mail.IdleDetector.resetIdleSecondsCount = oldFunc;
            obj._ETWListener.dispose();
	        tc.start();
        };
        Mail.IdleSchedulerChecker.call(obj);
        s.addJob(null, p.A, null, function () {
            s.dispose();
        });
    });

})();