// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:06 2021
// </auto-generated>
// --------------------------------------------------

type VpnChannel = any
type VpnPacketBuffer = any
type VpnPacketBufferList = any

export interface IVpnPlugIn {
    connect(channel: VpnChannel): void;
    disconnect(channel: VpnChannel): void;
    getKeepAlivePayload(channel: VpnChannel): VpnPacketBuffer;
    encapsulate(channel: VpnChannel, packets: VpnPacketBufferList, encapulatedPackets: VpnPacketBufferList): void;
    decapsulate(channel: VpnChannel, encapBuffer: VpnPacketBuffer, decapsulatedPackets: VpnPacketBufferList, controlPacketsToSend: VpnPacketBufferList): void;
}
