// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { IEndpointManager } from "./IEndpointManager";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { EndpointId } from "./Endpoints/EndpointId";

export const BASE_URL = "http://localhost:5000";

@GenerateShim('Microsoft.Entertainment.Util.EndpointManager')
export class EndpointManager implements IEndpointManager { 
    getEndpointCulture(): string {
        // throw new Error('EndpointManager#getEndpointCulture not implemented')
        return "en";
    }
    getEndpointUri(eEndpointId: number): string {
        // throw new Error('EndpointManager#getEndpointUri not implemented')
        console.warn("get endpoint url " + EndpointId[eEndpointId]);
        return BASE_URL + "/api/" + EndpointId[eEndpointId].substring(5);
    }
}
