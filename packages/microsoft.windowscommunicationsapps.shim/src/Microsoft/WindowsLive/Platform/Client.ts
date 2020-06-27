import { EventTarget, ShimProxyHandler } from "winrt-node/Windows.Foundation"
import { WindowsLive } from "../Enums";
import { AccountManager } from "./AccountManager";
import { PeopleManager } from "./PeopleManager";
import { MailManager } from "./MailManager";
import { CalendarManager } from "./CalendarManager";
import { FolderManager } from "./FolderManager";

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

    suspend() {

    }

    resume() {
        
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

    requestDelayedResources() {
        // this.accountManager._accountsByScenario.dispatchEvent(new Event("collectionchanged"));
    }
}