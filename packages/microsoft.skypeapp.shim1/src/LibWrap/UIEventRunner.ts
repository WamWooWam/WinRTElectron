export enum UIEventContext {
    ui,
    background,
}

export class UIEventRunner {
    static _instance: UIEventRunner;

    static instance() {
        return UIEventRunner._instance ?? (UIEventRunner._instance = new UIEventRunner());
    }

    run(context: UIEventContext, durationThreshold: number): void {

    }

    close() {
        console.error('shimmed function UIEventRunner.close')
    }
}