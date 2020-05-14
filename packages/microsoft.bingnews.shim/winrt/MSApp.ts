import { UI } from "./Windows.UI";

export function getViewOpener() {
    return null;
}

export function createNewView(uri: string) {
    return {
        viewId: 10,
        postMessage: () => {

        }
    };
}

export function suppressSubdownloadCredentialPrompts(suppress: boolean) {

}

export function execUnsafeLocalFunction(func: Function) {
    func(); // lmao tf am i meant to do here
}

export function terminateApp(e: any) {
    let dialog = new UI.Popups.MessageDialog(e.stack, "An error has occurred");
    dialog.showAsync().then(() => {
        window.parent.postMessage({ source: "MSApp", event: "terminateApp", data: { error: e } }, "*");
    });
}