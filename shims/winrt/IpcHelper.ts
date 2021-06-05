import { ipcRenderer, ipcMain } from 'electron';

export class IpcHelper {
    public static post(channel: string, data: any): void {
        let request = {
            data: data
        }

        ipcRenderer.sendToHost(channel, request);
    }

    public static send<TResponse>(channel: string, data: any): Promise<TResponse> {
        let request = {
            data: data,
            responseChannel: data.responseChannel
        }

        if (!request.responseChannel) {
            request.responseChannel = `${channel}_rtx_${new Date().getTime()}`
        }

        ipcRenderer.sendToHost(channel, request);

        return new Promise(resolve => {
            ipcRenderer.once(request.responseChannel, (event, response) => resolve(response));
        });
    }
}