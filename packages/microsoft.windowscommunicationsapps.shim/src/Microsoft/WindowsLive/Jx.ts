export class Jx {
    startSession() {
        console.log("jx::startSession");
    }

    flushSession() {
        console.log("jx::flushSession");
    }

    fault(...args) {
        console.log("jx::fault", args);
    }

    erRegisterFile(...args) {
        console.log("jx::erRegisterFile", args);
    }

    ptStopResize(...args) {
        console.log("jx::ptStopResize", args);
    }

    ptStopResume(...args) {
        console.log("jx::ptStopResume", args);
    }

    ptStopLaunch(...args) {
        console.log("jx::ptStopLaunch", args);
    }

    ptStopData(...args) {
        console.log("jx::ptStopData", args);
    }

    ptStop(...args) {
        console.log("jx::ptStop", args);
    }

    ptStart(...args) {
        console.log("jx::ptStart", args);
    }

    etw(...args) {
        console.log("jx::etw", args);
    }
}