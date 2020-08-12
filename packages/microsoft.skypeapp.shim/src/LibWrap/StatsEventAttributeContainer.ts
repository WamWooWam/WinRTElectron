import { Binary } from "./Binary";

export class StatsEventAttributeContainer {

    deserialize(binary: Binary): void {
        console.warn('shimmed function StatsEventAttributeContainer.deserialize');
    }

    send(eventType: number): void {
        console.warn('shimmed function StatsEventAttributeContainer.send');
    }

    addIntegerValue(key: number, value: number): void {
        console.warn('shimmed function StatsEventAttributeContainer.addIntegerValue');
    }

    addStringValue(key: number, value: string): void {
        console.warn('shimmed function StatsEventAttributeContainer.addStringValue');
    }

    close(): void {
        console.warn('shimmed function StatsEventAttributeContainer.close');
    }

}
export enum StatsClickStreamEvents {
    event_ID = 1,
    value,
    last_EVENT_ID,
    sec_FROM_LAST_EVENT,
}
export enum StatsHardwareInventoryInfo {
    trigger_TYPE = 1,
    relation_ID,
    inventory_STRING,
    os_NAME,
    os_VERSION,
    device_MANUFACTURER,
    device_NAME,
    inventory_STRING_EXTRAS,
}
export enum StatsWin8Events {
    event_ID = 1,
    value,
    event_COUNTER,
}