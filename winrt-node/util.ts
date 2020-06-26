import { ipcRenderer, IpcMessageEvent } from "electron";

export const IPC_CHANNEL = "WinRT";
export const postIpcMessage = (source: string, event: string, data: any) => {
    ipcRenderer.sendToHost(IPC_CHANNEL, {
        data: JSON.stringify({ source, event, data })
    })
}

export function randstr(length: number) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function isInWWA() {
    try {
        return typeof window == "object" && window.self !== window.top;
    } catch (e) {
        return true;
    }
}

export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
