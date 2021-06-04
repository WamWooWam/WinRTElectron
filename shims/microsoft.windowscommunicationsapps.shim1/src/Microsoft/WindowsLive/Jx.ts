export class Jx  {
    etw(hstrEventName: string): void {
        console.warn('shimmed function Jx.etw');
    }

    ptStart(hstrName: string, hstrKey: string): void {
        console.warn('shimmed function Jx.ptStart');
    }

    ptStop(hstrName: string, hstrKey: string): void {
        console.warn('shimmed function Jx.ptStop');
    }

    ptStopData(hstrName: string, hstrKey: string, dw1: number, dw2: number, dw3: number, dw4: number, dw5: number, hstrData1: string, hstrData2: string): void {
        console.warn('shimmed function Jx.ptStopData');
    }

    ptStopLaunch(timePoint: number, kind: number): void {
        console.warn('shimmed function Jx.ptStopLaunch');
    }

    ptStopResume(timePoint: number): void {
        console.warn('shimmed function Jx.ptStopResume');
    }

    ptStopResize(timePoint: number, isMajorChange: Boolean, isRotate: Boolean, logicalWidth: number, logicalHeight: number): void {
        console.warn('shimmed function Jx.ptStopResize');
    }

    erRegisterFile(hstrFilePath: string): void {
        console.warn('shimmed function Jx.erRegisterFile');
    }

    fault(hstrScenarioName: string, hstrErrorLocationId: string, hrFaultCode: number): void {
        console.warn('shimmed function Jx.fault');
    }

    startSession(): void {
        console.warn('shimmed function Jx.startSession');
    }

    flushSession(): void {
        console.warn('shimmed function Jx.flushSession');
    }
}