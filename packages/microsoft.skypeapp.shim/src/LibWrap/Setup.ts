import { ApplicationData } from "winrt-node/Windows.Storage";
import { debug } from "console";

export class Setup {

    private data: any;

    constructor(key?: string) {
        this.data = ApplicationData.current.localSettings.lookup(key ?? "__setupdata") ?? {};
    }

    isDefined(key: string): Boolean {
        console.log(`setup: isDefined ${key}`);

        let { obj, mainKey } = this.extractObj(key);
        return obj[mainKey] !== undefined;
    }

    delete(key: string): void {
        console.log(`setup: delete ${key}`);

        let { obj, mainKey } = this.extractObj(key);
        delete obj[mainKey];

        ApplicationData.current.localSettings.set("__setupdata", this.data);
    }

    getSubKey(key: string, index: number): string {
        console.log(`setup: getSubKey ${key} ${index}`);

        let { obj, mainKey } = this.extractObj(key);
        return obj[mainKey][index];
    }

    getStr(key: string): string {
        console.log(`setup: getStr ${key}`);

        let { obj, mainKey } = this.extractObj(key);
        return obj[mainKey];
    }

    getInt(key: string, defaultValue: number): number {
        console.log(`setup: getInt ${key}`);

        let { obj, mainKey } = this.extractObj(key);
        return obj[mainKey] ?? defaultValue;
    }

    setInt(key: string, value: number): void {
        console.log(`setup: setInt ${key} ${value}`);

        let { obj, mainKey } = this.extractObj(key);
        obj[mainKey] = value;

        ApplicationData.current.localSettings.set("__setupdata", this.data);
    }

    setStr(key: string, value: string): void {
        console.log(`setup: setStr ${key} ${value}`);

        let { obj, mainKey } = this.extractObj(key);
        obj[mainKey] = value;

        ApplicationData.current.localSettings.set("__setupdata", this.data);
    }
    
    private extractObj(key: string) {
        let keys = key.split("/");
        let mainKey = keys[keys.length - 1];
        let subKeys = keys.splice(0, keys.length - 1);
        let obj = this.data;
        for (const key of subKeys) {
            obj = obj[key] ?? (obj[key] = {});
        }
        return { obj, mainKey };
    }
}