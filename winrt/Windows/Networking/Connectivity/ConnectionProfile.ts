
import { IVectorView } from "../../Foundation/Collections/IVectorView`1";
import { DateTime } from "../../Foundation/DateTime";
import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { ConnectionCost } from "./ConnectionCost";
import { ConnectivityInterval } from "./ConnectivityInterval";
import { DataPlanStatus } from "./DataPlanStatus";
import { DataUsage } from "./DataUsage";
import { DataUsageGranularity } from "./DataUsageGranularity";
import { DomainConnectivityLevel } from "./DomainConnectivityLevel";
import { NetworkAdapter } from "./NetworkAdapter";
import { NetworkConnectivityLevel } from "./NetworkConnectivityLevel";
import { NetworkCostType } from "./NetworkCostType";
import { NetworkSecuritySettings } from "./NetworkSecuritySettings";
import { NetworkUsage } from "./NetworkUsage";
import { NetworkUsageStates } from "./NetworkUsageStates";
import { RoamingStates } from "./RoamingStates";
import { WlanConnectionProfileDetails } from "./WlanConnectionProfileDetails";
import { WwanConnectionProfileDetails } from "./WwanConnectionProfileDetails";

@GenerateShim('Windows.Networking.Connectivity.ConnectionProfile')
export class ConnectionProfile { 
    networkAdapter: NetworkAdapter = null;
    networkSecuritySettings: NetworkSecuritySettings = null;
    profileName: string = null;
    isWlanConnectionProfile: boolean = null;
    isWwanConnectionProfile: boolean = null;
    serviceProviderGuid: string | null = null;
    wlanConnectionProfileDetails: WlanConnectionProfileDetails = null;
    wwanConnectionProfileDetails: WwanConnectionProfileDetails = null;

    private connectivityLevel: NetworkConnectivityLevel;
    constructor(connectivityLevel: NetworkConnectivityLevel) {
        this.connectivityLevel = connectivityLevel;
    }

    getNetworkConnectivityLevel(): NetworkConnectivityLevel {
        return this.connectivityLevel;
    }
    getNetworkNames(): IVectorView<string> {
        throw new Error('ConnectionProfile#getNetworkNames not implemented')
    }
    getConnectionCost(): ConnectionCost {
        let cost = new ConnectionCost();
        cost.networkCostType = NetworkCostType.unrestricted;
        cost.overDataLimit = false;
        cost.approachingDataLimit = false;
        cost.roaming = false;

        return cost;
    }
    getDataPlanStatus(): DataPlanStatus {
        throw new Error('ConnectionProfile#getDataPlanStatus not implemented')
    }
    getLocalUsage(startTime: Date, endTime: Date): DataUsage {
        throw new Error('ConnectionProfile#getLocalUsage not implemented')
    }
    getLocalUsagePerRoamingStates(startTime: Date, endTime: Date, states: RoamingStates): DataUsage {
        throw new Error('ConnectionProfile#getLocalUsagePerRoamingStates not implemented')
    }
    getSignalBars(): number | null {
        throw new Error('ConnectionProfile#getSignalBars not implemented')
    }
    getDomainConnectivityLevel(): DomainConnectivityLevel {
        throw new Error('ConnectionProfile#getDomainConnectivityLevel not implemented')
    }
    getNetworkUsageAsync(startTime: Date, endTime: Date, granularity: DataUsageGranularity, states: NetworkUsageStates): IAsyncOperation<IVectorView<NetworkUsage>> {
        throw new Error('ConnectionProfile#getNetworkUsageAsync not implemented')
    }
    getConnectivityIntervalsAsync(startTime: Date, endTime: Date, states: NetworkUsageStates): IAsyncOperation<IVectorView<ConnectivityInterval>> {
        throw new Error('ConnectionProfile#getConnectivityIntervalsAsync not implemented')
    }
}
