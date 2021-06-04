import { WindowsLive } from "../Enums";
import { PlatformObject } from "./PlatformObject";
import { MailView } from "./MailView";
import { Foundation } from "winrt-node/Windows"
import { Enumerable } from "winrt-node/Windows.Foundation";
import { ShimProxyHandler } from "winrt-node/ShimProxyHandler";

export class Folder extends PlatformObject {
    constructor(mailView: MailView) {
        super("Folder");
        this.objectId = "Folder" + mailView.objectId;
        return new Proxy(this, new ShimProxyHandler("Folder"));
    }

    startSyncFolderContents(bool: boolean) {

    }

    @Enumerable(true)
    get folderName() {
        return "Test"
    }

    @Enumerable(true)
    get specialMailFolderType(): WindowsLive.Platform.MailFolderType {
        return WindowsLive.Platform.MailFolderType.inbox;
    }
}