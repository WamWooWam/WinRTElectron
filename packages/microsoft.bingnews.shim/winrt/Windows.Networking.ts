import { EventTarget, Collections } from "./Windows.Foundation";

export namespace Networking {

    export enum HostNameType {
        domainName, 
        ipv4,
        ipv6,
        bluetooth
    }

    export class HostName {
        type: HostNameType;
        rawName: string;
    }
    
    export namespace Connectivity {
        export enum NetworkConnectivityLevel {
            none,
            localAccess,
            internetAccess,
            constainedInternetAccess
        }

        export class ConnectionProfile {
            private connectivityLevel: NetworkConnectivityLevel;
            constructor(connectivityLevel: NetworkConnectivityLevel) {
                this.connectivityLevel = connectivityLevel;
            }

            getNetworkConnectivityLevel(): NetworkConnectivityLevel {
                return this.connectivityLevel;
            }
        }

        export class NetworkInformation {
            private static source: EventTarget;

            static ensureSource() {
                if (NetworkInformation.source == null) {
                    NetworkInformation.source = new EventTarget();
                }
            }

            static addEventListener(event: string, handler: EventListenerOrEventListenerObject) {
                console.log("adding event handler for: " + event)
                NetworkInformation.ensureSource();
                NetworkInformation.source.addEventListener(event, handler);
            }

            static removeEventListener(event: string, handler: EventListenerOrEventListenerObject) {
                console.log("removing event handler for: " + event)
                NetworkInformation.ensureSource();
                NetworkInformation.source.removeEventListener(event, handler);
            }

            static dispatchEvent(ev: Event) {
                console.log("dispatching: " + ev.type)
                NetworkInformation.ensureSource();
                NetworkInformation.source.dispatchEvent(ev)
            }

            static getInternetConnectionProfile() {
                return new ConnectionProfile(NetworkConnectivityLevel.internetAccess);
            }

            static getHostNames() {
                let x = new HostName();
                x.type = HostNameType.ipv4;
                x.rawName = "127.0.0.1";
                return new Collections.Vector([x]);
            }
        }
    }
}