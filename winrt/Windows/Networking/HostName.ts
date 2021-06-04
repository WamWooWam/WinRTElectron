
import { IStringable } from "../Foundation/IStringable";
import { GenerateShim } from "../Foundation/Interop/GenerateShim";
import { IPInformation } from "./Connectivity/IPInformation";
import { HostNameType } from "./HostNameType";

@GenerateShim('Windows.Networking.HostName')
export class HostName implements IStringable { 
    canonicalName: string = null;
    displayName: string = null;
    ipinformation: IPInformation = null;
    rawName: string = null;
    type: HostNameType = null;
    constructor(hostName: string) {
        this.rawName = hostName;
        this.type = HostNameType.ipv4;
    }
    isEqual(hostName: HostName): boolean {
        throw new Error('HostName#isEqual not implemented')
    }
    toString(): string {
        throw new Error('HostName#toString not implemented')
    }
    static compare(value1: string, value2: string): number {
        throw new Error('HostName#compare not implemented')
    }
}
