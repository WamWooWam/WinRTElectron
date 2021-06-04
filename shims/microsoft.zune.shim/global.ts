import { machineIdSync } from "node-machine-id";

export function getXUID() {
    return machineIdSync().substring(0, 16);
}