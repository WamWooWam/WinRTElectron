// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from LibWrap 255.255.255.255 at Fri Mar 26 17:24:55 2021
// </auto-generated>
// --------------------------------------------------

import { UIEventContext } from "./UIEventContext";
import { IClosable } from "winrt/Windows/Foundation/IClosable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

export class UIEventRunner implements IClosable { 
    private static __instance;
    static instance(): UIEventRunner {
        return new UIEventRunner();
    }
    run(context: UIEventContext, durationThreshold: number): void {
            
    }

    close(): void {
        console.warn('UIEventRunner#close not implemented')
    }
}
