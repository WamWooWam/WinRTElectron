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
    console.error(e);
}