import { PlatformObject } from "./PlatformObject"
import { WindowsLive } from "../Enums"
import { Contact } from "./Contact"
import { AccountsResource } from "./AccountsResource"
import { MailResource } from "./MailResource"
import { Collection } from "./Utils";
import { ShimProxyHandler, Enumerable } from "winrt-node/Windows.Foundation"

export class Account extends PlatformObject {
    constructor(id: string) {
        super("Account");
        this.objectId = id;
        this.lastAuthResult = 0;
        return new Proxy(this, new ShimProxyHandler());
    }

    @Enumerable(true)
    public get accountType(): WindowsLive.Platform.AccountType {
        return WindowsLive.Platform.AccountType.imap;
    }

    @Enumerable(true)
    public get emailAddress(): string {
        return "wamwoowam@gmail.com";
    }

    @Enumerable(true)
    public get displayName(): string {
        return "Wan Kerr Co. Ltd.";
    }

    @Enumerable(true)
    public get accountIconType(): WindowsLive.Platform.AccountIconType {
        return WindowsLive.Platform.AccountIconType.other;
    }

    @Enumerable(true)
    public get iconSmallUrl(): string {
        return "https://cdn.discordapp.com/emojis/422838511553609728.gif?v=1";
    }

    @Enumerable(true)
    public get iconMediumUrl(): string {
        return "https://cdn.discordapp.com/emojis/422838511553609728.gif?v=1";
    }

    @Enumerable(true)
    public get color(): number {
        return Number.parseInt("0078D7", 16);
    }

    @Enumerable(true)
    public get meContact(): Contact {
        let cont = new Contact(null);
        cont.objectId = "sakodkaspd";
        return cont;
    }

    @Enumerable(true)
    public get syncType(): WindowsLive.Platform.SyncType {
        return WindowsLive.Platform.SyncType.manual;
    }

    @Enumerable(true)
    public get mailScenarioState(): WindowsLive.Platform.ScenarioState {
        return WindowsLive.Platform.ScenarioState.connected;
    }

    @Enumerable(true)
    public get sendAsAddresses(): string[] {
        return [];
    }

    @Enumerable(true)
    public get editableResources(): Collection {
        return new Collection([WindowsLive.Platform.ResourceType.contacts]);
    }

    @Enumerable(true)
    public get serviceContactsName(): string {
        return "Wan Kerr Co. Ltd.";
    }

    lastAuthResult: number = 0;

    getConfigureType(scenario: WindowsLive.Platform.ApplicationScenario): WindowsLive.Platform.ConfigureType {
        return WindowsLive.Platform.ConfigureType.createConnectedAccount;
    }

    getServerByType(t: WindowsLive.Platform.ServerType) {
        return t == WindowsLive.Platform.ServerType.imap ? "imap.gmail.com" : null;
    }

    getResourceByType(r: WindowsLive.Platform.ResourceType) {
        if (r == WindowsLive.Platform.ResourceType.accounts)
            return new AccountsResource(this.objectId);
        if (r == WindowsLive.Platform.ResourceType.mail)
            return new MailResource();

        return null;
    }
}
