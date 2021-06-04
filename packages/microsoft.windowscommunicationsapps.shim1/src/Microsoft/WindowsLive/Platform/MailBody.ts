import { PlatformObject } from "./PlatformObject";
import { WindowsLive } from "../Enums";

export class MailBody extends PlatformObject {

    constructor(type: WindowsLive.Platform.MailBodyType) {
        super("MailBody");
        this.type = type - 1;
    }

    type: WindowsLive.Platform.MailBodyType;
    truncated: boolean = false;
    body: string = "<p>I like cock </p>";
    method: string = "";
    metadata: string = "{}";
}