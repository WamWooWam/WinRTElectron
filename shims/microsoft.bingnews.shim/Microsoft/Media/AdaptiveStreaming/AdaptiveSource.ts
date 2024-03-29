// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:09 2021
// </auto-generated>
// --------------------------------------------------

import { AdaptiveSourceFailedEventHandler } from "./AdaptiveSourceFailedEventHandler";
import { AdaptiveSourceStatusUpdatedEventHandler } from "./AdaptiveSourceStatusUpdatedEventHandler";
import { IAdaptiveSource } from "./IAdaptiveSource";
import { Manifest } from "./Manifest";
import { ManifestReadyEventHandler } from "./ManifestReadyEventHandler";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { Uri } from "winrt/Windows/Foundation/Uri";

@GenerateShim('Microsoft.Media.AdaptiveStreaming.AdaptiveSource')
export class AdaptiveSource implements IAdaptiveSource { 
    readonly manifest: Manifest = null;
    readonly uri: Uri = null;

    private __adaptiveSourceFailedEvent: Set<AdaptiveSourceFailedEventHandler> = new Set();
    @Enumerable(true)
    set onadaptivesourcefailedevent(handler: AdaptiveSourceFailedEventHandler) {
        this.__adaptiveSourceFailedEvent.add(handler);
    }

    private __adaptiveSourceStatusUpdatedEvent: Set<AdaptiveSourceStatusUpdatedEventHandler> = new Set();
    @Enumerable(true)
    set onadaptivesourcestatusupdatedevent(handler: AdaptiveSourceStatusUpdatedEventHandler) {
        this.__adaptiveSourceStatusUpdatedEvent.add(handler);
    }

    private __manifestReadyEvent: Set<ManifestReadyEventHandler> = new Set();
    @Enumerable(true)
    set onmanifestreadyevent(handler: ManifestReadyEventHandler) {
        this.__manifestReadyEvent.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'adaptivesourcefailedevent':
                this.__adaptiveSourceFailedEvent.add(handler);
                break;
            case 'adaptivesourcestatusupdatedevent':
                this.__adaptiveSourceStatusUpdatedEvent.add(handler);
                break;
            case 'manifestreadyevent':
                this.__manifestReadyEvent.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'adaptivesourcefailedevent':
                this.__adaptiveSourceFailedEvent.delete(handler);
                break;
            case 'adaptivesourcestatusupdatedevent':
                this.__adaptiveSourceStatusUpdatedEvent.delete(handler);
                break;
            case 'manifestreadyevent':
                this.__manifestReadyEvent.delete(handler);
                break;
        }
    }
}
