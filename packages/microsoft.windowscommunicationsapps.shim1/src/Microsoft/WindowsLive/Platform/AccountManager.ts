import { Manager } from "./ManagerBase"
import { Client } from "./Client"
import { Collection } from "./Utils"
import {Account } from "./Account"

export class AccountManager extends Manager {
    private _defaultAccount;
    _accountsByScenario: Collection;

    constructor(client: Client) {
        super(client)
        this._defaultAccount = new Account("valid-id");
        this._accountsByScenario = new Collection([this._defaultAccount]);
    }

    public loadAccount(id: string) {
        return this.defaultAccount;
    }

    public get defaultAccount(): Account {
        return this._defaultAccount;
    }

    getConnectedAccountsByScenario(...args) {
        return this._accountsByScenario;
    }

    getConnectableAccountsByScenario(){
        return this._accountsByScenario;
    }
}