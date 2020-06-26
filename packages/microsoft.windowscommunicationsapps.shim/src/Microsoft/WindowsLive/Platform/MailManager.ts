import { Manager } from "./ManagerBase";
import { MailView } from "./MailView";
import { Client } from "./Client";
import { MailMessage } from "./MailMessage";
import { Collection } from "./Utils";
import { WindowsLive } from "../Enums";
import { ShimProxyHandler } from "winrt-node/Windows.Foundation";
import { uuidv4 } from "winrt-node/util";
import { Windows } from "winrt-node";
import { Account } from "./Account";
import { AccountManager } from "./AccountManager";

export class MailManager extends Manager {

    mailViews: Map<WindowsLive.Platform.MailViewType, MailView>;
    mailMessages: Map<string, MailMessage>;

    constructor(client: Client) {
        super(client)
        this.mailViews = new Map<WindowsLive.Platform.MailViewType, MailView>();
        this.mailMessages = new Map<string, MailMessage>();
    }

    ensureMailView(view: WindowsLive.Platform.MailViewType, accountId: string, objectId: string) {

        if (view == WindowsLive.Platform.MailViewType.allPinnedPeople)
            return null;

        if (!this.mailViews.has(view)) {
            var newView = new Proxy(new MailView(view), new ShimProxyHandler);
            newView.objectId = objectId;
            this.mailViews.set(view, newView);
            return newView;
        }
        else {
            return this.mailViews.get(view);
        }
    }

    createDraftMessage(view: MailView) {
        let message = new MailMessage();
        message.sourceMessageStoreId = uuidv4();
        message.accountId = "valid-id";
        this.mailMessages.set(message.sourceMessageStoreId, message);

        return message;
    }

    loadMessage(hstrMessageId: string) {
        return this.mailMessages.get(hstrMessageId);
    }

    public setMailVisible(bool: boolean) {

    }

    public getMailView(type: WindowsLive.Platform.MailViewType, account: Account) {

    }

    public getMailViews(type: WindowsLive.Platform.MailViewScenario, accountId: string): Collection {
        if (type != WindowsLive.Platform.MailViewScenario.allPeople)
            return new Collection(Array.from(this.mailViews.values()));

        return new Collection([]);
    }
}