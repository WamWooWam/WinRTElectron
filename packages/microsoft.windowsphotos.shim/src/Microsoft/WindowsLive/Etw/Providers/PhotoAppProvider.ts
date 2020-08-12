import *as Windows from 'winrt-node/Windows'

export class PhotoAppProvider {
    public log(hstrEventName: string, pPropertySet: Windows.Foundation.Collections.IPropertySet): void {
        console.warn('shimmed function PhotoAppProvider.log');
    }

    public log_1(hstrEventName: string): void {
        console.warn('shimmed function PhotoAppProvider.log_1');
    }

}