// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from LibWrap 255.255.255.255 at Fri Mar 26 17:24:56 2021
// </auto-generated>
// --------------------------------------------------

import { Conversation } from "../Conversation";
import { CountChangedType } from "../CountChangedType";
import { WrSkyLib } from "../WrSkyLib";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('LibWrap.VM.UnreadCountQuery')
export class UnreadCountQuery { 
    constructor(lib: WrSkyLib) {
        console.warn('UnreadCountQuery.ctor not implemented')
    }
    reload(): void {
        console.warn('UnreadCountQuery#reload not implemented')
    }
    handleConversationPropertiesChange(conversation: Conversation, props: IVector<number>): void {
        console.warn('UnreadCountQuery#handleConversationPropertiesChange not implemented')
    }
    handleConversationListChange(sender: any, id: number, filterType: number, added: boolean): void {
        console.warn('UnreadCountQuery#handleConversationListChange not implemented')
    }

    private __countChanged: Set<CountChangedType> = new Set();
    @Enumerable(true)
    set oncountchanged(handler: CountChangedType) {
        this.__countChanged.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'countchanged':
                this.__countChanged.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'countchanged':
                this.__countChanged.delete(handler);
                break;
        }
    }
}
