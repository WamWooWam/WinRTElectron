import { PlatformObject } from "./PlatformObject";
import { Folder } from "./Folder";
import { Collection } from "./Utils";
import { WindowsLive } from "../Enums";
import { Enumerable } from "winrt-node/Windows.Foundation";

export class MailView extends PlatformObject {
    view: WindowsLive.Platform.MailViewType;
    isPinnedToNavPane: boolean;

    constructor(view: WindowsLive.Platform.MailViewType) {
        super("MailView");
        this.objectId = "MailView" + view;
        this.view = view;
        this.isPinnedToNavPane = true;

        console.warn("MailView " + view)
    }

    @Enumerable(true)
    get sourceObject(): Folder {
        return new Folder(this);
    }

    @Enumerable(true)
    get type() {
        return this.view;
    }

    @Enumerable(true)
    get notificationCount() {
        return 1;
    }

    @Enumerable(true)
    get canChangePinState() {
        return false;
    }

    clearUnseenMessages() {

    }

    getMessages(): Collection {
        return new Collection([]);
    }

    getLaunchArguments(): string {
        return "";
    }
}
