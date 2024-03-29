// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { AdErrorEventArgs } from "./AdErrorEventArgs";
import { AdEventArgs } from "./AdEventArgs";
import { Advertisement } from "./Advertisement";
import { IMap } from "winrt/Windows/Foundation/Collections/IMap`2";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { AsyncOperation } from "winrt/Windows/Foundation/Interop/AsyncOperation`1";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "winrt/Windows/Foundation/TypedEventHandler`2";

@GenerateShim('MicrosoftAdvertising.Shared.WinRT.AdPlacement')
export class AdPlacement implements IStringable { 
    applicationId: string = null;
    adTags: IMap<string, string> = null;
    adUnitId: string = null;
    width: number = null;
    height: number = null;
    latitude: number = null;
    longitude: number = null;
    readonly lastError: AdErrorEventArgs = null;
    getAdAsync(): IAsyncOperation<Advertisement> {
        return AsyncOperation.from(async () => { throw new Error('AdPlacement#getAdAsync not implemented') });
    }
    toString(): string {
        throw new Error('AdPlacement#toString not implemented')
    }

    private __adRefreshed: Set<TypedEventHandler<AdPlacement, AdEventArgs>> = new Set();
    @Enumerable(true)
    set onadrefreshed(handler: TypedEventHandler<AdPlacement, AdEventArgs>) {
        this.__adRefreshed.add(handler);
    }

    private __errorOccurred: Set<TypedEventHandler<AdPlacement, AdErrorEventArgs>> = new Set();
    @Enumerable(true)
    set onerroroccurred(handler: TypedEventHandler<AdPlacement, AdErrorEventArgs>) {
        this.__errorOccurred.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'adrefreshed':
                this.__adRefreshed.add(handler);
                break;
            case 'erroroccurred':
                this.__errorOccurred.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'adrefreshed':
                this.__adRefreshed.delete(handler);
                break;
            case 'erroroccurred':
                this.__errorOccurred.delete(handler);
                break;
        }
    }
}
