import { Client } from "./Client"

export abstract class Manager {
    protected client: Client;

    constructor(client: Client) {
        this.client = client;
    }
}