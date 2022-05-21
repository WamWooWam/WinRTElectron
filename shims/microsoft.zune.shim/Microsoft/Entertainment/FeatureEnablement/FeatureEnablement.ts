// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { FeatureItem } from "./FeatureItem";
import { FeaturesChangedEventHandlerArgs } from "./FeaturesChangedEventHandlerArgs";
import { IFeatureEnablement } from "./IFeatureEnablement";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "winrt/Windows/Foundation/TypedEventHandler`2";

@GenerateShim('Microsoft.Entertainment.FeatureEnablement.FeatureEnablement')
export class FeatureEnablement implements IFeatureEnablement {
    isEnabled(feature: FeatureItem): number {
        console.log("requested feature enablement for " + FeatureItem[feature]);

        if (feature == FeatureItem.cloudCollectionV2Enabled) return 0;

        return 1;
    }
    checkForNewFeatures(): void {
        console.warn('FeatureEnablement#checkForNewFeatures not implemented')
    }

    private __featuresChangedEvent: Set<TypedEventHandler<IFeatureEnablement, FeaturesChangedEventHandlerArgs>> = new Set();
    @Enumerable(true)
    set onfeatureschangedevent(handler: TypedEventHandler<IFeatureEnablement, FeaturesChangedEventHandlerArgs>) {
        this.__featuresChangedEvent.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'featureschangedevent':
                this.__featuresChangedEvent.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'featureschangedevent':
                this.__featuresChangedEvent.delete(handler);
                break;
        }
    }
}
