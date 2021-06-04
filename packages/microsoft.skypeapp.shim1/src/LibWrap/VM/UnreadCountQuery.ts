import { Conversation } from "../Conversation";
import { WrSkyLib } from "../WrSkyLib";

export class UnreadCountQuery {
    constructor(lib: WrSkyLib) {}

    reload(): void {
        console.warn('shimmed function UnreadCountQuery.reload');
    }

    handleConversationPropertiesChange(conversation: Conversation, props: number[]): void {
        console.warn('shimmed function UnreadCountQuery.handleConversationPropertiesChange');
    }

    handleConversationListChange(sender: /* System.Object */ any, id: number, filterType: number, added: Boolean): void {
        console.warn('shimmed function UnreadCountQuery.handleConversationListChange');
    }

    addEventListener(name: string, handler: Function) {
        console.warn(`UnreadCountQuery::addEventListener: ${name}`);
        switch (name) {
            case "countchanged": // CountChangedType
                break;
        }

    }
}