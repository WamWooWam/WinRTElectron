// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:06 2021
// </auto-generated>
// --------------------------------------------------

import { IVector } from "../../Foundation/Collections/IVector`1";
import { HostName } from "../HostName";
type VpnNamespaceInfo = any

export interface IVpnNamespaceInfoFactory {
    createVpnNamespaceInfo(name: string, dnsServerList: IVector<HostName>, proxyServerList: IVector<HostName>): VpnNamespaceInfo;
}
