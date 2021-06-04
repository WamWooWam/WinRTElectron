
import { IIterable } from "../../Foundation/Collections/IIterable`1";
import { IVectorView } from "../../Foundation/Collections/IVectorView`1";
import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Uri } from "../../Foundation/Uri";
import { ConnectionProfile } from "./ConnectionProfile";
import { ConnectionProfileFilter } from "./ConnectionProfileFilter";
import { LanIdentifier } from "./LanIdentifier";
import { NetworkStatusChangedEventHandler } from "./NetworkStatusChangedEventHandler";
import { ProxyConfiguration } from "./ProxyConfiguration";
import { EndpointPair } from "../EndpointPair";
import { HostName } from "../HostName";
import { HostNameSortOptions } from "../HostNameSortOptions";
import { NetworkConnectivityLevel } from "./NetworkConnectivityLevel";
import { ReadOnlyVector } from "../../Foundation/Interop/ReadOnlyVector`1";

@GenerateShim('Windows.Networking.Connectivity.NetworkInformation')
export class NetworkInformation { 
    static findConnectionProfilesAsync(pProfileFilter: ConnectionProfileFilter): IAsyncOperation<IVectorView<ConnectionProfile>> {
        throw new Error('NetworkInformation#findConnectionProfilesAsync not implemented')
    }
    static getConnectionProfiles(): IVectorView<ConnectionProfile> {
        throw new Error('NetworkInformation#getConnectionProfiles not implemented')
    }
    static getInternetConnectionProfile(): ConnectionProfile {
        return new ConnectionProfile(NetworkConnectivityLevel.internetAccess);
    }
    static getLanIdentifiers(): IVectorView<LanIdentifier> {
        throw new Error('NetworkInformation#getLanIdentifiers not implemented')
    }
    static getHostNames(): IVectorView<HostName> {
        return new ReadOnlyVector([new HostName("127.0.0.1")]);
    }
    static getProxyConfigurationAsync(uri: Uri): IAsyncOperation<ProxyConfiguration> {
        throw new Error('NetworkInformation#getProxyConfigurationAsync not implemented')
    }
    static getSortedEndpointPairs(destinationList: IIterable<EndpointPair>, sortOptions: HostNameSortOptions): IVectorView<EndpointPair> {
        throw new Error('NetworkInformation#getSortedEndpointPairs not implemented')
    }

    static __networkStatusChanged: Set<NetworkStatusChangedEventHandler> = new Set();
    @Enumerable(true)
    static set onnetworkstatuschanged(handler: NetworkStatusChangedEventHandler) {
        NetworkInformation.__networkStatusChanged.add(handler);
    }

    static addEventListener(name: string, handler: any) {
        switch (name) {
            case 'networkstatuschanged':
                NetworkInformation.__networkStatusChanged.add(handler);
                break;
        }
    }

    static removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'networkstatuschanged':
                NetworkInformation.__networkStatusChanged.delete(handler);
                break;
        }
    }
}
