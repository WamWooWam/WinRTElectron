import { ApplicationData } from "winrt-node/Windows.Storage";

export class IMCache {
    static _name: string = 'imcache';

    static save(cache: string): void {
        ApplicationData.current.localSettings.set(IMCache._name, cache);    
    }

    static load(): string {
        return ApplicationData.current.localSettings.lookup(IMCache._name) ?? "";    
    }

}