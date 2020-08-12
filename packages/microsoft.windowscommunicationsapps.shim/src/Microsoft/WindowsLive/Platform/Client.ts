import { EventTarget, IAsyncAction } from "winrt-node/Windows.Foundation"
import { ShimProxyHandler } from "winrt-node/ShimProxyHandler";
import { WindowsLive } from "../Enums";
import { AccountManager } from "./AccountManager";
import { PeopleManager } from "./PeopleManager";
import { MailManager } from "./MailManager";
import { CalendarManager } from "./CalendarManager";
import { FolderManager } from "./FolderManager";
import { Account } from "./Account";
import { PluginVerb } from "./PluginVerb";
import { IDisposable } from "./IDisposable";

export class Client extends EventTarget {
    private _calendarManager: CalendarManager;
    private _accountManager: AccountManager;
    private _peopleManager: PeopleManager;
    private _mailManager: MailManager;
    private _folderManager: FolderManager;
    private _dbRequest: IDBRequest;
    private _db: IDBDatabase;

    constructor(createOptions: WindowsLive.Platform.ClientCreateOptions) {
        super();

        var error = new Error("The specified account does not exist.");
        error["number"] = -2146893042;
        //throw error;

        this._dbRequest = indexedDB.open("windows_communication_apps", 1);
        this._dbRequest.addEventListener("success", this.onDatabaseOpened.bind(this));
        this._dbRequest.addEventListener("upgradeneeded", this.onDatabaseUpgradeNeeded.bind(this));

        this._accountManager = new AccountManager(this);
        this._peopleManager = new PeopleManager(this);
        this._mailManager = new MailManager(this);
        this._calendarManager = new CalendarManager(this);
        this._folderManager = new FolderManager(this);

        return new Proxy(this, new ShimProxyHandler());
    }

    onDatabaseOpened(ev: Event) {
        this._db = this._dbRequest.result;
    }

    onDatabaseUpgradeNeeded(ev: Event) {
        this._db = (ev.target as IDBOpenDBRequest).result;
        this._peopleManager.initialiseDatabase(this.db);
    }

    public get db(): IDBDatabase {
        return this._db;
    }

    public get accountManager(): AccountManager {
        return new Proxy(this._accountManager, new ShimProxyHandler());
    }

    public get calendarManager(): CalendarManager {
        return new Proxy(this._calendarManager, new ShimProxyHandler());
    }

    public get peopleManager(): PeopleManager {
        return new Proxy(this._peopleManager, new ShimProxyHandler());
    }

    public get mailManager(): MailManager {
        return new Proxy(this._mailManager, new ShimProxyHandler());
    }

    public get folderManager(): FolderManager {
        return new Proxy(this._folderManager, new ShimProxyHandler());
    }

    public get isMock(): boolean {
        return true;
    }  
    
    dispose(): void {
        console.warn('shimmed function Client.dispose');
    }

    flushLogfile(): string {
        throw new Error('shimmed function Client.flushLogfile');
    }

    requestDelayedResources(): void {
        console.warn('shimmed function Client.requestDelayedResources');
    }

    suspend(): void {
        console.warn('shimmed function Client.suspend');
    }

    resume(): void {
        console.warn('shimmed function Client.resume');
    }

    registerForDispose(pDisposable: IDisposable): void {
        console.warn('shimmed function Client.registerForDispose');
    }

    unregisterForDispose(pDisposable: IDisposable): void {
        console.warn('shimmed function Client.unregisterForDispose');
    }

    createVerb(hstrVerbName: string, hstrVerbParams: string): PluginVerb {
        throw new Error('shimmed function Client.createVerb');
    }

    createVerbFromTask(hstrVerbName: string, hstrVerbParams: string, pTaskInstance: any): PluginVerb {
        throw new Error('shimmed function Client.createVerbFromTask');
    }

    createVerbFromTaskWithContext(hstrVerbName: string, hstrVerbParams: string, pContext: any, pTaskInstance: any): PluginVerb {
        throw new Error('shimmed function Client.createVerbFromTaskWithContext');
    }

    runResourceVerb(pAccount: Account, hstrResName: string, pVerb: PluginVerb): void {
        console.warn('shimmed function Client.runResourceVerb');
    }

    runResourceVerbAsync(pAccount: Account, hstrResName: string, pVerb: PluginVerb): IAsyncAction {
        throw new Error('shimmed function Client.runResourceVerbAsync');
    }

    cancelResourceVerb(pAccount: Account, hstrResName: string, pVerb: PluginVerb): void {
        console.warn('shimmed function Client.cancelResourceVerb');
    }

    addEventListener(name: string, handler: Function) {
        console.warn(`Client::addEventListener: ${name}`);
        switch (name) {
            case "restartneeded": // RestartNeededHandler
                break;
        }

    }
}