import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { ApplicationData } from "winrt/Windows/Storage/ApplicationData";

@GenerateShim('LibWrap.IMCache')
export class IMCache {
    static _name: string = 'IMCache';

    static save(cache: string): void {
        ApplicationData.current.localSettings.values.insert(IMCache._name, cache);    
    }

    static load(): string {
        return ApplicationData.current.localSettings.values.lookup(IMCache._name) ?? "";    
    }

}